import React, { Component } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	AsyncStorage,
	ActivityIndicator,
} from 'react-native';

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { Container, Icon, Text } from 'native-base';

import SegmentedControlTab from 'react-native-segmented-control-tab';

import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import Color from '../../theme/Colors';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';
import { userUrl } from '../../utils/global';

export class Home extends Component {
	state = {
		selectedIndex: LoggedUserCredentials.getUserType() === 'FARMER' ? 0 : 1,
		isLoading: false,
		isError: false,
		numberOfUser: 0,
		wholeScreenLoading: true,
		location: null,
	};

	componentDidMount() {
		this.setState({ wholeScreenLoading: true }, this._getLocationAsync);
	}

	_getLocationAsync = async () => {
		const loc = LoggedUserCredentials.getLocation();

		if (loc) {
			this.setState({ location: loc, wholeScreenLoading: false, isLoading: true }, () =>
				this.getData(),
			);
		} else {
			const { status } = await Permissions.askAsync(Permissions.LOCATION);

			if (status !== 'granted') {
				this.setState({
					errorMessage: 'Permission to access location was denied',
				});
			}

			const { coords } = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });

			LoggedUserCredentials.setLocation(coords);

			this.setState({ location: coords, wholeScreenLoading: false, isLoading: true }, () =>
				this.getData(),
			);
		}
	};

	async getData() {
		const path = userUrl + '/getUserCount?userType=' + LoggedUserCredentials.getUserType();

		const config = {
			headers: {
				Authorization: 'Bearer ' + LoggedUserCredentials.getAccessToken(),
			},
			method: 'GET',
		};

		try {
			const res = await fetch(path, config);

			if (res.status == 200) {
				const resJson = await res.json();
				this.setState({
					isLoading: false,
					isError: false,
					numberOfUser: resJson.user_count,
				});
			} else if (res.status == 500) {
				this.setState({ isLoading: false, isError: true });
			}
		} catch (error) {
			this.setState({ isLoading: false, isError: true });
		}
	}

	_handleLogOut = async () => {
		const keys = ['accessToken', 'userId', 'userName', 'userType'];

		try {
			await AsyncStorage.multiRemove(keys);
			this.props.navigation.navigate('Auth');
		} catch (e) {
			console.log('cannot store data');
		}
	};

	_handleRetry = () => {
		this.setState({ isLoading: true }, () => this.getData());
	};

	_setRef = ref => (this.sellInfoRef = ref);

	_gotoTradingInfoList = () =>
		this.props.navigation.navigate('TradingInfoList', {
			showAddButton: true,
		});

	_openNearMe = () => this.props.navigation.navigate('NearMe');

	openMessage = () => this.props.navigation.navigate('Message');

	render() {
		const { numberOfUser, isLoading, isError, wholeScreenLoading, location } = this.state;

		if (wholeScreenLoading) {
			return (
				<View style={styles.centerContent}>
					<ActivityIndicator color={Color.mainColor} size='large' />
				</View>
			);
		}

		return (
			<Container>
				<ScrollView contentContainerStyle={{ flex: 1 }}>
					<View style={styles.segmentContainer}>
						<SegmentedControlTab
							tabsContainerStyle={segStyle.tabsContainerStyle}
							tabStyle={segStyle.tabStyle}
							firstTabStyle={segStyle.firstTabStyle}
							lastTabStyle={segStyle.lastTabStyle}
							tabTextStyle={segStyle.tabTextStyle}
							activeTabStyle={segStyle.activeTabStyle}
							activeTabTextStyle={segStyle.activeTabTextStyle}
							values={['Farmer', 'Middleman']}
							selectedIndex={this.state.selectedIndex}
							onTabPress={this._handleLogOut}
						/>
					</View>

					<MapView
						style={{ height: '100%' }}
						provider={PROVIDER_GOOGLE}
						showsUserLocation
						initialRegion={{
							latitude: location.latitude,
							longitude: location.longitude,
							latitudeDelta: 0.015,
							longitudeDelta: 0.015,
						}}
					/>

					<View style={styles.footerContainer}>
						<View style={styles.nameContainer}>
							<Text
								style={
									styles.nameStyle
								}>{`Hello, ${LoggedUserCredentials.getUserName()}`}</Text>
						</View>

						{isLoading ? (
							<View style={styles.centerContent}>
								<ActivityIndicator color={Color.mainColor} size='large' />
							</View>
						) : isError ? (
							<View style={styles.centerContent}>
								<TouchableOpacity>
									<View style={{ alignItems: 'center' }}>
										<Icon name='ios-wifi' color='black' style={{ fontSize: 40 }} />
										<Text>No Internet Connection !</Text>
										<Text> Tap To Retry </Text>
									</View>
								</TouchableOpacity>
							</View>
						) : (
							<>
								{LoggedUserCredentials.getUserType() === 'FARMER' ? (
									<Text
										style={
											styles.usingText
										}>{`${numberOfUser} of farmers are using AgriMatch!`}</Text>
								) : (
									<Text
										style={
											styles.usingText
										}>{`${numberOfUser} of middlemen are using AgriMatch!`}</Text>
								)}

								<View style={styles.bubbleMenuContainer}>
									<TouchableOpacity
										style={styles.btnBubbleContainer}
										onPress={this.openMessage}>
										<View style={{ alignItems: 'center' }}>
											<View style={styles.iconWrapper}>
												<Icon
													name='ios-chatbubbles'
													size={20}
													style={styles.iconStyle}
												/>
											</View>
											<Text style={styles.msgStyle}>Messages</Text>
										</View>
									</TouchableOpacity>

									<TouchableOpacity
										style={styles.btnBubbleContainer}
										onPress={this._gotoTradingInfoList}>
										<View style={{ alignItems: 'center' }}>
											<View style={styles.iconWrapper}>
												<Icon name='add' size={20} style={styles.iconStyle} />
											</View>
											{LoggedUserCredentials.getUserType() === 'FARMER' ? (
												<Text style={styles.msgStyle}>Sell Goods</Text>
											) : (
												<Text style={styles.msgStyle}>Buy Goods</Text>
											)}
										</View>
									</TouchableOpacity>

									<TouchableOpacity
										style={[styles.btnBubbleContainer, { paddingTop: 20 }]}
										onPress={this._openNearMe}>
										<View style={{ alignItems: 'center' }}>
											<View style={styles.iconWrapper}>
												<Icon name='search' size={20} style={styles.iconStyle} />
											</View>
											<Text
												style={{
													color: Color.mainColor,
													textAlign: 'center',
												}}>
												Find People Near Me
											</Text>
										</View>
									</TouchableOpacity>
								</View>
							</>
						)}
					</View>
				</ScrollView>
			</Container>
		);
	}
}

const segStyle = StyleSheet.create({
	tabsContainerStyle: {
		borderColor: Color.mainColor,
	},
	tabStyle: {
		borderRadius: 1,
	},
	firstTabStyle: {
		borderColor: Color.mainColor,
	},
	lastTabStyle: {
		borderColor: Color.mainColor,
	},
	tabTextStyle: {
		color: Color.mainColor,
	},
	activeTabStyle: {
		backgroundColor: Color.mainColor,
	},
	activeTabTextStyle: {
		color: '#fff',
	},
});

const styles = StyleSheet.create({
	segmentContainer: {
		paddingTop: 10,
		position: 'absolute',
		zIndex: 999,
		width: '60%',
		alignSelf: 'center',
	},
	footerContainer: {
		position: 'absolute',
		zIndex: 999,
		height: '30%',
		width: '100%',
		backgroundColor: '#fff',
		bottom: -1,
	},
	nameContainer: {
		width: '100%',
		height: '25%',
		backgroundColor: Color.mainColor,
		alignItems: 'center',
		justifyContent: 'center',
	},
	nameStyle: {
		color: '#fff',
		fontSize: 17,
	},
	bubbleMenuContainer: {
		paddingTop: 14,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	nearMeMenuContainer: {
		paddingVertical: 15,
		flex: 1,
		justifyContent: 'space-between',
		paddingHorizontal: 40,
	},
	nearMeText: {
		fontSize: 16,
		color: Color.mainColor,
	},
	btnBubbleContainer: {
		width: 100,
		height: 80,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconWrapper: {
		width: 50,
		height: 50,
		backgroundColor: Color.mainColor,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
	},
	msgStyle: {
		textAlign: 'left',
		color: Color.mainColor,
	},
	iconStyle: {
		color: '#fff',
	},
	usingText: {
		textAlign: 'center',
		color: Color.mainColor,
		paddingTop: 5,
	},
	centerContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
