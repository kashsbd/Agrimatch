import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

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

import { userUrl } from '../../utils/global';

export class Profile extends Component {
	state = {
		feedbackText: '',
		feedBackStartCount: 0,
		recordingUri: undefined,
	};

	close = () => {
		this.props.navigation.goBack();
	};

	onSave = () => {
		const { feedbackText, feedBackStartCount, recordingUri } = this.state;

		console.log(recordingUri);
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

		const { feedbackText, feedBackStartCount } = this.state;

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
						<Button transparent onPress={this.onSave}>
							<Icon name='checkmark' />
						</Button>
					</Right>
				</Header>

				<Content>
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
				</Content>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	logo: {
		flex: 1,
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
});
