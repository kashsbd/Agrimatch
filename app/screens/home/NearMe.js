import React, { Component } from 'react';
import {
	StyleSheet,
	View,
	ScrollView,
	Text as RNText,
	Linking,
	TouchableOpacity,
	ActivityIndicator,
} from 'react-native';

import { Container, Button, Text, Header, Left, Icon, Body, Right, Title } from 'native-base';

import StarRating from 'react-native-star-rating';

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { withTranslation } from 'react-i18next';

import Color from '../../theme/Colors';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';

import { locationUrl } from '../../utils/global';

class NearMeScreen extends Component {
	state = {
		dialogVisible: false,
		markers: [],
		selectedGroup: null,
		previewVisible: false,

		showFarmersCount: false,
		showMiddlemenCount: false,
		loading: true,
		location: null,
		wholeScreenLoading: true,
	};

	componentDidMount() {
		this.setState({ wholeScreenLoading: true }, this._getLocationAsync);
	}

	_getLocationAsync = async () => {
		if (LoggedUserCredentials.getLocation()) {
			this.setState({
				location: LoggedUserCredentials.getLocation(),
				wholeScreenLoading: false,
			});
		} else {
			const { status } = await Permissions.askAsync(Permissions.LOCATION);

			if (status !== 'granted') {
				this.setState({
					errorMessage: 'Permission to access location was denied',
				});
			}

			const { coords } = await Location.getCurrentPositionAsync({});

			this.setState({ location: coords, wholeScreenLoading: false });
		}
	};

	close = () => this.props.navigation.goBack();

	_findFarmers = () => {
		this.setState({ loading: true }, () => this._getNearestFarmer());
	};

	async _getNearestFarmer() {
		const {
			location: { latitude, longitude },
		} = this.state;

		const { t } = this.props;

		const lat = latitude ? latitude : 12.45;

		const lng = longitude ? longitude : 14.23;

		const path = locationUrl + '/nearme?userType=FARMER' + '&lng=' + lng + '&lat=' + lat;

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
					loading: false,
					markers: resJson,
					showFarmersCount: true,
					showMiddlemenCount: false,
				});
			} else if (res.status == 500) {
				this.setState(
					{
						loading: false,
						markers: [],
					},
					() => alert(t('errors:try_later')),
				);
			}
		} catch (error) {
			this.setState({ loading: false, markers: [] }, () => alert(t('errors:no_internet')));
		}
	}

	_findMiddlemen = () => {
		this.setState({ loading: true }, this._getNearestMiddleman);
	};

	_getNearestMiddleman = async () => {
		const {
			location: { latitude, longitude },
		} = this.state;

		const { t } = this.props;

		const lat = latitude ? latitude : 12.45;

		const lng = longitude ? longitude : 14.23;

		const path = locationUrl + '/nearme?userType=MIDDLEMAN' + '&lng=' + lng + '&lat=' + lat;

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
					loading: false,
					markers: resJson,
					showFarmersCount: false,
					showMiddlemenCount: true,
				});
			} else if (res.status == 500) {
				this.setState(
					{
						loading: false,
						markers: [],
					},
					() => alert(t('errors:try_later')),
				);
			}
		} catch (error) {
			this.setState({ loading: false, markers: [] }, () => alert(t('errors:no_internet')));
		}
	};

	onMarkerPressed = marker => () => {
		this.setState({ previewVisible: true, selectedGroup: marker });
	};

	_backToOriginalScreen = () =>
		this.setState({
			previewVisible: false,
			selectedGroup: null,
			showFarmersCount: false,
			showMiddlemenCount: false,
			dialogVisible: false,
		});

	call = () => {
		const { selectedGroup } = this.state;

		const phno = selectedGroup.user.phno;
		Linking.openURL('tel:' + phno);
	};

	onGroupChatPressed = marker => () => {
		this.setState({ dialogVisible: true, selectedGroup: marker });
	};

	handleCancel = () => this.setState({ dialogVisible: false, selectedGroup: null });

	joinGroup = () => {
		const data = {
			selectedGroup: this.state.selectedGroup,
		};

		this._backToOriginalScreen();

		this.props.navigation.navigate('Chat', { data });
	};

	_gotoSellingInfoList = () =>
		this.props.navigation.navigate('TradingInfoList', {
			showAddButton: false,
			user: this.state.selectedGroup,
		});

	renderFarmerPreview() {
		const {
			selectedGroup: {
				user: { rateCount, totalRateValue },
			},
		} = this.state;

		const averageRating = totalRateValue / rateCount;

		return (
			<View>
				<View
					style={{
						alignSelf: 'center',
						flexDirection: 'row',
						paddingTop: 10,
					}}>
					<Icon
						name='pin'
						style={{
							alignSelf: 'center',
							marginRight: 12,
							color: Color.mainColor,
							fontSize: 30,
						}}
					/>
					<StarRating
						disabled={true}
						maxStars={5}
						rating={averageRating}
						starSize={30}
						fullStarColor='gray'
					/>
				</View>

				<View style={styles.bubbleMenuContainer}>
					<TouchableOpacity style={styles.btnBubbleContainer} onPress={this.joinGroup}>
						<View style={{ alignItems: 'center' }}>
							<View style={styles.iconWrapper}>
								<Icon name='ios-chatbubbles' style={styles.markerIcon} />
							</View>
						</View>
					</TouchableOpacity>

					<TouchableOpacity style={styles.btnBubbleContainer} onPress={this.call}>
						<View style={{ alignItems: 'center' }}>
							<View style={styles.iconWrapper}>
								<Icon name='call' style={styles.markerIcon} />
							</View>
						</View>
					</TouchableOpacity>

					<TouchableOpacity style={styles.btnBubbleContainer} onPress={this._gotoSellingInfoList}>
						<View style={{ alignItems: 'center' }}>
							<View style={styles.iconWrapper}>
								<Icon name='eye' style={styles.markerIcon} />
							</View>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	renderNearMeButtons() {
		const { showFarmersCount, showMiddlemenCount, markers } = this.state;
		const { t } = this.props;

		return (
			<View style={styles.nearMeMenuContainer}>
				{showFarmersCount ? (
					<View style={{ alignSelf: 'center' }}>
						<Text style={{ color: Color.mainColor, textAlign: 'center' }}>
							{t('nearme:showing_farmers')}
						</Text>
						<Text
							style={{
								textAlign: 'center',
								color: Color.mainColor,
							}}>
							{t('nearme:results_found', { count: markers.length })}
						</Text>
					</View>
				) : (
					<Button block light style={{ height: 42 }} onPress={this._findFarmers}>
						<RNText style={styles.nearMeText}>{t('nearme:show_farmers')}</RNText>
					</Button>
				)}

				{showMiddlemenCount ? (
					<View style={{ alignSelf: 'center' }}>
						<Text style={{ color: Color.mainColor }}>{t('nearme:showing_middlemen')}</Text>
						<Text
							style={{
								textAlign: 'center',
								color: Color.mainColor,
							}}>
							{t('nearme:results_found', { count: markers.length })}
						</Text>
					</View>
				) : (
					<Button block style={{ marginTop: 5, height: 42 }} light onPress={this._findMiddlemen}>
						<RNText style={styles.nearMeText}>{t('nearme:show_middlemen')}</RNText>
					</Button>
				)}
			</View>
		);
	}

	render() {
		const {
			markers,
			dialogVisible,
			previewVisible,
			selectedGroup,
			showFarmersCount,
			showMiddlemenCount,
			wholeScreenLoading,
			location,
		} = this.state;

		const { t } = this.props;

		return (
			<Container>
				<Header style={{ backgroundColor: Color.mainColor }}>
					<Left>
						<Button transparent onPress={this.close}>
							<Icon name='arrow-back' color='white' />
						</Button>
					</Left>
					<Body>
						<Title style={styles.whiteColor}>{t('nearme:title')}</Title>
					</Body>
					<Right />
				</Header>

				{wholeScreenLoading ? (
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}>
						<ActivityIndicator color={Color.mainColor} size='large' />
					</View>
				) : (
					<ScrollView contentContainerStyle={{ flex: 1 }}>
						<MapView
							style={{ height: '100%' }}
							provider={PROVIDER_GOOGLE}
							showsUserLocation
							initialRegion={{
								latitude: location.latitude,
								longitude: location.longitude,
								latitudeDelta: 0.02,
								longitudeDelta: 0.02,
							}}>
							{markers.map((marker, index) => {
								const chatType = marker.chatType;

								if (chatType === 'GROUP') {
									const coord = {
										latitude: marker.location.coordinates[1],
										longitude: marker.location.coordinates[0],
									};

									return (
										<Marker
											key={index}
											coordinate={coord}
											onPress={this.onGroupChatPressed(marker)}
											title={marker.user.name}>
											<View style={styles.markerIconWrapper}>
												<Icon name='people' style={styles.markerIcon} />
											</View>
										</Marker>
									);
								} else if (chatType === 'SINGLE') {
									const coord = {
										latitude: marker.location.coordinates[1],
										longitude: marker.location.coordinates[0],
									};

									return (
										<Marker
											pinColor={Color.mainColor}
											onPress={this.onMarkerPressed(marker)}
											key={index}
											coordinate={coord}
											title={marker.user.name}>
											<Icon
												name='person'
												style={{
													color: Color.mainColor,
												}}
											/>
										</Marker>
									);
								}
							})}
						</MapView>

						<View style={styles.footerContainer}>
							<View style={styles.nameContainer}>
								{selectedGroup || showFarmersCount || showMiddlemenCount || dialogVisible ? (
									<View
										style={{
											flexDirection: 'row',
											width: '100%',
										}}>
										<Left style={{ flex: 1 }} />
										<Body style={{ flex: 0 }}>
											<Text style={styles.nameStyle}>
												{selectedGroup
													? selectedGroup.name
													: t('nearme:greeting', {
															name: LoggedUserCredentials.getUserName(),
													  })}
											</Text>
										</Body>
										<Right>
											<Button transparent onPress={this._backToOriginalScreen}>
												<Icon name='backspace' size={20} style={styles.markerIcon} />
											</Button>
										</Right>
									</View>
								) : (
									<Text style={styles.nameStyle}>
										{t('nearme:greeting', { name: LoggedUserCredentials.getUserName() })}
									</Text>
								)}
							</View>

							{dialogVisible ? (
								<View
									style={{
										flex: 1,
										justifyContent: 'center',
									}}>
									<View
										style={{
											flexDirection: 'row',
											alignSelf: 'center',
										}}>
										<View
											style={[
												styles.markerIconWrapper,
												{
													width: 64,
													height: 64,
													borderRadius: 32,
												},
											]}>
											<Icon name='people' style={styles.markerIcon} />
										</View>
										<View style={{ marginLeft: 10 }}>
											<Text
												style={{
													alignSelf: 'center',
													color: Color.mainColor,
													marginBottom: 3,
												}}>
												Community Group Chat
											</Text>
											<Button
												onPress={this.joinGroup}
												style={{
													backgroundColor: Color.mainColor,
													width: '100%',
													justifyContent: 'center',
													height: '45%',
												}}>
												<RNText
													style={{
														color: '#fff',
														alignSelf: 'center',
													}}>
													Join Chat
												</RNText>
											</Button>
										</View>
									</View>
								</View>
							) : previewVisible ? (
								this.renderFarmerPreview()
							) : (
								this.renderNearMeButtons()
							)}
						</View>
					</ScrollView>
				)}
			</Container>
		);
	}
}

const NearMe = withTranslation(['nearme, errors', 'common'])(NearMeScreen);

export { NearMe };

const styles = StyleSheet.create({
	footerContainer: {
		height: '30%',
		width: '100%',
		backgroundColor: '#fff',
		position: 'absolute',
		zIndex: 999,
		bottom: 1,
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
	nearMeMenuContainer: {
		paddingVertical: 10,
		flex: 1,
		justifyContent: 'space-around',
		paddingHorizontal: 40,
	},
	nearMeText: {
		fontSize: 16,
		color: Color.mainColor,
	},
	markerIconWrapper: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: Color.mainColor,
		alignItems: 'center',
		justifyContent: 'center',
	},
	markerIcon: {
		color: '#fff',
	},
	iconWrapper: {
		width: 50,
		height: 50,
		backgroundColor: Color.mainColor,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
	},
	bubbleMenuContainer: {
		alignSelf: 'center',
		flexDirection: 'row',
	},
	btnBubbleContainer: {
		width: 100,
		height: 80,
		justifyContent: 'center',
		alignItems: 'center',
	},
	whiteColor: {
		color: 'white',
	},
});
