import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import AppNavigator from './app/navigation/AppNavigator';

export default function App(props) {
	const [isLoadingComplete, setLoadingComplete] = useState(false);

	if (!isLoadingComplete && !props.skipLoadingScreen) {
		return (
			<AppLoading
				startAsync={loadResourcesAsync}
				onError={handleLoadingError}
				onFinish={() => handleFinishLoading(setLoadingComplete)}
			/>
		);
	} else {
		return (
			<View style={styles.container}>
				{Platform.OS === 'ios' && <StatusBar barStyle='default' />}
				<AppNavigator />
			</View>
		);
	}
}

async function loadResourcesAsync() {
	await Promise.all([
		Asset.loadAsync([require('./app/assets/images/logo.png'), require('./app/assets/images/propic.png')]),
		Font.loadAsync({
			Roboto: require('native-base/Fonts/Roboto.ttf'),
			Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
			...Ionicons.font,
			Padauk_Bold: require('./app/assets/fonts/Padauk_Bold.ttf'),
			Padauk_Regular: require('./app/assets/fonts/Padauk_Regular.ttf'),
		}),
	]);
}

function handleLoadingError(error) {
	console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
	setLoadingComplete(true);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
});
