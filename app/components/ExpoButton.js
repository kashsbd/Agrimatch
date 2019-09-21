import React from 'react';

import { StyleSheet, Text, TouchableHighlight, View, ActivityIndicator } from 'react-native';

import ExpoColors from '../theme/ExpoColors';

const Button = ({ disabled, loading, title, onPress, onPressIn, style, buttonStyle, children }) => (
	<View style={[styles.container, style]}>
		<TouchableHighlight
			style={[styles.button, disabled && styles.disabledButton, buttonStyle]}
			disabled={disabled || loading}
			onPressIn={onPressIn}
			onPress={onPress}
			underlayColor={ExpoColors.highlightColor}>
			{children ||
				(loading ? (
					<ActivityIndicator size='small' color='white' />
				) : (
					<Text style={styles.label}>{title}</Text>
				))}
		</TouchableHighlight>
	</View>
);

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 3,
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: ExpoColors.tintColor,
	},
	disabledButton: {
		backgroundColor: ExpoColors.disabled,
	},
	label: {
		color: '#ffffff',
		fontWeight: '700',
	},
});

export default Button;
