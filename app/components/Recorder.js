import React from 'react';
import * as Permissions from 'expo-permissions';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import ExpoColors from '../theme/ExpoColors';

export class Recorder extends React.Component {
	state = {
		canRecord: true,
		durationMillis: 0,
		isRecording: false,
	};

	componentWillUnmount() {
		if (this._recorder) {
			this._recorder.stopAndUnloadAsync();

			this._recorder.setOnRecordingStatusUpdate(null);
		}
	}

	componentDidMount() {
		this.askPermission();
	}

	async askPermission() {
		try {
			await Permissions.askAsync(Permissions.AUDIO_RECORDING);
		} catch (error) {
			this.setState({ errorMessage: error.message });
		}
	}

	_recorder = undefined;

	_updateStateToStatus = status => this.setState(status);

	_record = async () => {
		await Audio.setAudioModeAsync({
			allowsRecordingIOS: true,
			interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
			playsInSilentModeIOS: true,
			shouldDuckAndroid: true,
			interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
			playThroughEarpieceAndroid: false,
			staysActiveInBackground: false,
		});

		try {
			const recordingObject = new Audio.Recording();

			await recordingObject.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY);

			recordingObject.setOnRecordingStatusUpdate(this._updateStateToStatus);

			const status = await recordingObject.getStatusAsync();

			this.setState({ ...status, options: Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY }, () => {
				this._recorder = recordingObject;
				this._recorder.startAsync();
			});
		} catch (error) {
			this.setState({ errorMessage: error.message });
		}
	};

	_togglePause = () => {
		if (this.state.isRecording) {
			this._recorder.pauseAsync();
		} else {
			this._recorder.startAsync();
		}
	};

	_stopAndUnload = async () => {
		await this._recorder.stopAndUnloadAsync();

		if (this.props.onDone) {
			this.props.onDone(this._recorder.getURI());
		}
		this._recorder = undefined;
		this.setState({ options: undefined, durationMillis: 0 });
	};

	_maybeRenderErrorOverlay = () => {
		if (this.state.errorMessage) {
			return (
				<ScrollView style={styles.errorMessage}>
					<Text style={styles.errorText}>{this.state.errorMessage}</Text>
				</ScrollView>
			);
		}
		return null;
	};

	_renderRecorderButtons = () => {
		const { isRecording, durationMillis } = this.state;

		if (!isRecording && durationMillis === 0) {
			return (
				<TouchableOpacity
					onPress={this._record}
					style={[styles.bigRoundButton, { backgroundColor: 'red' }]}>
					<Ionicons name='ios-mic' style={[styles.bigIcon, { color: 'white' }]} />
				</TouchableOpacity>
			);
		}

		return (
			<View>
				<TouchableOpacity
					onPress={this._togglePause}
					style={[styles.bigRoundButton, { borderColor: 'red', borderWidth: 5 }]}>
					<Ionicons
						name={`ios-${this.state.isRecording ? 'pause' : 'mic'}`}
						style={[styles.bigIcon, { color: 'red' }]}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={this._stopAndUnload}
					style={[
						styles.smallRoundButton,
						{
							backgroundColor: 'red',
							position: 'absolute',
							bottom: -5,
							right: -5,
							borderColor: 'white',
							borderWidth: 4,
						},
					]}>
					<Ionicons name='ios-square' style={[styles.smallIcon, { color: 'white' }]} />
				</TouchableOpacity>
			</View>
		);
	};

	render() {
		return (
			<View style={this.props.style}>
				<View style={styles.centerer}>
					{this._renderRecorderButtons()}
					<Text style={{ fontWeight: 'bold', marginTop: 6 }}>
						{_formatTime(this.state.durationMillis / 1000)}
					</Text>
				</View>
				{this._maybeRenderErrorOverlay()}
			</View>
		);
	}
}

const _formatTime = duration => {
	const paddedSecs = _leftPad(`${Math.floor(duration % 60)}`, '0', 2);
	const paddedMins = _leftPad(`${Math.floor(duration / 60)}`, '0', 2);
	if (duration > 3600) {
		return `${Math.floor(duration / 3600)}:${paddedMins}:${paddedSecs}`;
	}
	return `${paddedMins}:${paddedSecs}`;
};

const _leftPad = (s, padWith, expectedMinimumSize) => {
	if (s.length >= expectedMinimumSize) {
		return s;
	}
	return _leftPad(`${padWith}${s}`, padWith, expectedMinimumSize);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-evenly',
		marginVertical: 10,
	},
	centerer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		padding: 8,
		fontSize: 24,
		color: ExpoColors.tintColor,
	},
	errorMessage: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: ExpoColors.errorBackground,
	},
	errorText: {
		margin: 8,
		fontWeight: 'bold',
		color: ExpoColors.errorText,
	},
	bigRoundButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	bigIcon: {
		fontSize: 40,
	},
	smallRoundButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		justifyContent: 'center',
		alignItems: 'center',
	},
	smallIcon: {
		fontSize: 20,
	},
});
