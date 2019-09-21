import React, { Component } from 'react';
import { StyleSheet, Image, View, Linking } from 'react-native';

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
	};

	close = () => {
		this.props.navigation.goBack();
	};

	onSave = () => {};

	onStarRatingPress = feedBackStartCount => this.setState({ feedBackStartCount });

	_handleRecordingFinished = recordingUri => this.setState({ recordingUri });

	_maybeRenderLastRecording = () =>
		this.state.recordingUri ? (
			<>
				<AudioPlayer source={{ uri: this.state.recordingUri }} />
			</>
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
							paddingTop: 35,
						}}>
						<H3 style={styles.h3}>Additional Feedback</H3>
						<Textarea
							rowSpan={4}
							bordered
							placeholder=''
							style={{ marginTop: 10 }}
							value={feedbackText}
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
});
