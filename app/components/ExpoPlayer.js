import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Slider } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import ExpoColors from '../theme/ExpoColors';

export default class ExpoPlayer extends React.Component {
	state = {
		userIsDraggingSlider: false,
	};

	_play = () => this.props.playAsync();

	_pause = () => this.props.pauseAsync();

	_playFromPosition = position =>
		this.props.setPositionAsync(position).then(() => this.setState({ userIsDraggingSlider: false }));

	_toggleLooping = () => this.props.setIsLoopingAsync(!this.props.isLooping);

	_toggleIsMuted = () => this.props.setIsMutedAsync(!this.props.isMuted);

	_toggleSlowRate = () =>
		this.props.setRateAsync(this.props.rate < 1 ? 1 : 0.5, this.props.shouldCorrectPitch);

	_toggleFastRate = () =>
		this.props.setRateAsync(this.props.rate > 1 ? 1 : 2, this.props.shouldCorrectPitch);

	_toggleShouldCorrectPitch = () =>
		this.props.setRateAsync(this.props.rate, !this.props.shouldCorrectPitch);

	_renderPlayPauseButton = () => {
		let onPress = this._pause;
		let iconName = 'ios-pause';

		if (!this.props.isPlaying) {
			onPress = this._play;
			iconName = 'ios-play';
		}

		return (
			<TouchableOpacity onPress={onPress} disabled={!this.props.isLoaded}>
				<Ionicons name={iconName} style={[styles.icon, styles.playPauseIcon]} />
			</TouchableOpacity>
		);
	};

	_maybeRenderErrorOverlay = () => {
		if (this.props.errorMessage) {
			return (
				<ScrollView style={styles.errorMessage}>
					<Text style={styles.errorText}>{this.props.errorMessage}</Text>
				</ScrollView>
			);
		}
		return null;
	};

	_renderAuxiliaryButton = ({ disable, iconName, title, onPress, active }) => {
		if (disable) {
			return null;
		}
		return (
			<TouchableOpacity
				key={title}
				style={[styles.button, active && styles.activeButton]}
				disabled={!this.props.isLoaded}
				onPress={onPress}>
				<Ionicons
					name={`ios-${iconName}`}
					style={[styles.icon, styles.buttonIcon, active && styles.activeButtonText]}
				/>
				<Text style={[styles.buttonText, active && styles.activeButtonText]}>{title}</Text>
			</TouchableOpacity>
		);
	};

	render() {
		return (
			<View style={this.props.style}>
				{this.props.header}
				<View style={styles.container}>
					{this._renderPlayPauseButton()}
					<Slider
						style={styles.slider}
						value={
							this.state.userIsDraggingSlider
								? this.state.positionMillisWhenStartedDragging
								: this.props.positionMillis
						}
						maximumValue={this.props.durationMillis}
						disabled={!this.props.isLoaded}
						minimumTrackTintColor={ExpoColors.tintColor}
						onSlidingComplete={this._playFromPosition}
						onResponderGrant={() =>
							this.setState({
								userIsDraggingSlider: true,
								positionMillisWhenStartedDragging: this.props.positionMillis,
							})
						}
					/>
					<Text style={{ width: 100, textAlign: 'right' }} adjustsFontSizeToFit numberOfLines={1}>
						{_formatTime(this.props.positionMillis / 1000)} /{' '}
						{_formatTime(this.props.durationMillis / 1000)}
					</Text>
				</View>
				<View style={[styles.container, styles.buttonsContainer]}>
					{this.props.extraButtons
						? this.props.extraButtons.map(this._renderAuxiliaryButton)
						: null}
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
	},
	icon: {
		padding: 8,
		fontSize: 24,
		color: ExpoColors.tintColor,
	},
	playPauseIcon: {
		paddingTop: 11,
		fontSize: 34,
	},
	slider: {
		flex: 1,
		marginHorizontal: 10,
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
	buttonsContainer: {
		justifyContent: 'space-evenly',
		alignItems: 'stretch',
	},
	button: {
		flex: 1,
		marginHorizontal: 10,
		paddingBottom: 6,
		borderRadius: 6,
		marginBottom: 10,
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	buttonText: {
		fontSize: 12,
		color: ExpoColors.tintColor,
		fontWeight: 'bold',
		textAlign: 'center',
		justifyContent: 'center',
		flex: 1,
	},
	buttonIcon: {
		flex: 1,
		height: 36,
	},
	activeButton: {
		backgroundColor: ExpoColors.tintColor,
	},
	activeButtonText: {
		color: 'white',
	},
});
