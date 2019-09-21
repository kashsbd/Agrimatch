import React from 'react';
import { Audio } from 'expo-av';

import ExpoPlayer from './ExpoPlayer';

export class AudioPlayer extends React.Component {
	state = {
		isLoaded: false,
		isLooping: false,
		isPlaying: false,
		positionMillis: 0,
		durationMillis: 0,
		rate: 1,
		shouldCorrectPitch: false,
	};

	componentDidMount() {
		this._loadSoundAsync(this.props.source);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.source !== this.props.source) {
			this._loadSoundAsync(nextProps.source);
		}
	}

	componentWillUnmount() {
		if (this._sound) {
			this._sound.unloadAsync();
		}
	}

	_loadSoundAsync = async source => {
		const soundObject = new Audio.Sound();

		try {
			await soundObject.loadAsync(source, { progressUpdateIntervalMillis: 150 });
			soundObject.setOnPlaybackStatusUpdate(this._updateStateToStatus);
			const status = await soundObject.getStatusAsync();
			this._updateStateToStatus(status);
			this._sound = soundObject;
		} catch (error) {
			this.setState({ errorMessage: error.message });
		}
	};

	_updateStateToStatus = status => this.setState(status);

	_playAsync = async () => this._sound.playAsync();

	_pauseAsync = async () => this._sound.pauseAsync();

	_setPositionAsync = async position => this._sound.setPositionAsync(position);

	_setIsLoopingAsync = async isLooping => this._sound.setIsLoopingAsync(isLooping);

	_setIsMutedAsync = async isMuted => this._sound.setIsMutedAsync(isMuted);

	_setRateAsync = async (
		rate,
		shouldCorrectPitch,
		pitchCorrectionQuality = Audio.PitchCorrectionQuality.Low,
	) => {
		await this._sound.setRateAsync(rate, shouldCorrectPitch, pitchCorrectionQuality);
	};

	render() {
		return (
			<ExpoPlayer
				{...this.state}
				style={this.props.style}
				playAsync={this._playAsync}
				pauseAsync={this._pauseAsync}
				setPositionAsync={this._setPositionAsync}
				setIsLoopingAsync={this._setIsLoopingAsync}
				setRateAsync={this._setRateAsync}
				setIsMutedAsync={this._setIsMutedAsync}
			/>
		);
	}
}
