import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Text } from 'react-native';

import {
	Container,
	Content,
	Button,
	Icon,
	Header,
	Left,
	Body,
	Right,
	Title,
	H3,
	Form,
	Textarea,
} from 'native-base';

import { Recorder, AudioPlayer } from '../../components';

import StarRating from 'react-native-star-rating';
import ImageLoad from 'react-native-image-placeholder';

import Color from '../../theme/Colors';

import { userUrl, ratingUrl } from '../../utils/global';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';

export class Profile extends Component {
	state = {
		feedbackText: '',
		feedBackStartCount: 0,
		recordingUri: undefined,
		isSaving: false,
	};

	close = () => {
		this.props.navigation.goBack();
	};

	_validate = () => {
		const { feedBackStartCount } = this.state;

		if (feedBackStartCount == 0) {
			alert("Can't save without rating user.");
		} else {
			this.setState({ isSaving: true }, this.onSave);
		}
	};

	onSave = async () => {
		const { feedbackText, feedBackStartCount, recordingUri } = this.state;

		const { user } = this.props.navigation.state.params;

		const data = new FormData();
		data.append('fromUser', LoggedUserCredentials.getUserId());
		data.append('toUser', user.user._id);
		data.append('value', feedBackStartCount);
		data.append('feedback', feedbackText);

		if (recordingUri) {
			const filename = recordingUri.split('/').pop();

			const match = /\.(\w+)$/.exec(filename);
			const type = match ? `audio/${match[1]}` : `audio`;

			data.append('feedbackAudio', {
				uri: recordingUri,
				type,
				name: filename,
			});
		}

		const config = {
			headers: {
				Authorization: 'Bearer ' + LoggedUserCredentials.getAccessToken(),
				'Content-Type': 'multipart/form-data',
			},
			method: 'POST',
			body: data,
		};

		try {
			const res = await fetch(ratingUrl, config);

			if (res.status === 201) {
				this.setState({
					isSaving: false,
					feedBackStartCount: 0,
					feedbackText: '',
					recordingUri: undefined,
				});
			} else {
				this.setState({ isSaving: false }, () => alert('Something went Wrong.Try Again!'));
			}
		} catch (error) {
			this.setState({ isSaving: false }, () => alert('Please connect to internet!'));
		}
	};

	onStarRatingPress = feedBackStartCount => this.setState({ feedBackStartCount });

	_handleRecordingFinished = recordingUri => this.setState({ recordingUri });

	_onTextChange = feedbackText => this.setState({ feedbackText });

	_cancelSong = () => this.setState({ recordingUri: undefined });

	_maybeRenderLastRecording = () =>
		this.state.recordingUri ? (
			<View style={styles.audioplayerContainer}>
				<AudioPlayer source={{ uri: this.state.recordingUri }} />
				<TouchableOpacity
					onPress={this._cancelSong}
					style={[
						styles.smallRoundButton,
						{
							backgroundColor: Color.mainColor,
							position: 'absolute',
							borderColor: 'white',
							borderWidth: 3,
							bottom: 35,
							left: 300,
							zIndex: -999,
						},
					]}>
					<Icon name='close' style={[styles.smallIcon, { color: 'white' }]} />
				</TouchableOpacity>
			</View>
		) : null;

	render() {
		const { user } = this.props.navigation.state.params;

		const { feedbackText, feedBackStartCount, isSaving } = this.state;

		return (
			<Container>
				<Header style={{ backgroundColor: Color.mainColor }}>
					<Left>
						<Button transparent onPress={this.close}>
							<Icon name='arrow-back' />
						</Button>
					</Left>
					<Body>
						<Title>{user ? `${user.user.name}'s Profile` : 'Profile'}</Title>
					</Body>
					<Right>
						<Button transparent onPress={this._validate} disabled={isSaving}>
							<Icon name='checkmark' />
						</Button>
					</Right>
				</Header>

				<Content contentContainerStyle={{ flexGrow: 1 }}>
					{isSaving ? (
						<View style={styles.centerContent}>
							<Text style={{ fontSize: 15, fontWeight: '500' }}>Saving ...</Text>
						</View>
					) : (
						<>
							<ImageLoad
								style={styles.logo}
								source={{ uri: userUrl + '/' + user.user._id + '/profile_pic' }}
								placeholderSource={require('../../assets/images/propic.png')}
								isShowActivity={true}
							/>

							<H3 style={styles.h3}>{`How was farmer ${user.user.name} ?`}</H3>

							<View
								style={{
									width: '60%',
									alignSelf: 'center',
									paddingTop: 5,
								}}>
								<StarRating
									disabled={false}
									maxStars={5}
									rating={feedBackStartCount}
									selectedStar={this.onStarRatingPress}
									fullStarColor='gray'
								/>
							</View>

							<Form
								style={{
									width: '70%',
									alignSelf: 'center',
									paddingTop: 25,
								}}>
								<H3 style={styles.h3}>Additional Feedback</H3>
								<Textarea
									rowSpan={4}
									bordered
									placeholder=''
									style={{ marginTop: 10 }}
									value={feedbackText}
									onChangeText={this._onTextChange}
								/>
							</Form>

							<Recorder onDone={this._handleRecordingFinished} style={{ marginTop: 10 }} />

							{this._maybeRenderLastRecording()}
						</>
					)}
				</Content>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	logo: {
		width: 120,
		height: 120,
		resizeMode: 'contain',
		alignSelf: 'center',
		marginTop: 20,
	},
	h3: {
		marginTop: 5,
		alignSelf: 'center',
	},
	audioplayerContainer: {
		marginHorizontal: 15,
		borderWidth: 1,
		borderColor: Color.mainColor,
		paddingHorizontal: 10,
		marginVertical: 10,
	},
	smallRoundButton: {
		width: 38,
		height: 38,
		borderRadius: 19,
		justifyContent: 'center',
		alignItems: 'center',
	},
	smallIcon: {
		fontSize: 18,
	},
	centerContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
