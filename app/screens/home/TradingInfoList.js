import React, { Component } from 'react';
import { StyleSheet, View, Text as RNText, ActivityIndicator, TouchableOpacity, Image } from 'react-native';

import { Container, Button, Icon, Header, Left, Body, Right, Title, Text, Item } from 'native-base';

import { AccordionList } from 'accordion-collapse-react-native';

import Color from '../../theme/Colors';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';
import { cropUrl, baseUrl } from '../../utils/global';

export class TradingInfoList extends Component {
	state = {
		loading: false,
		crops: [],
		error: false,
		page: 1,
		totalPages: 1,
		refreshing: false,
	};

	componentDidMount() {
		this.setState({ loading: true }, () => this.getAllCrops());
	}

	async getAllCrops() {
		const { page, crops } = this.state;

		const { user, showAddButton } = this.props.navigation.state.params;

		const config = {
			headers: {
				Authorization: 'Bearer ' + LoggedUserCredentials.getAccessToken(),
			},
			method: 'GET',
		};

		const userId = showAddButton ? LoggedUserCredentials.getUserId() : user.user._id;

		const url = cropUrl + '?page=' + page + '&user=' + userId;

		try {
			const res = await fetch(url, config);

			if (res.status == 200) {
				const resJson = await res.json();
				this.setState({
					crops: page === 1 ? resJson.docs : [...crops, ...resJson.docs],
					totalPages: resJson.pages,
					loading: false,
					error: false,
					refreshing: false,
				});
			} else if (res.status == 500) {
				this.setState({
					loading: false,
					error: true,
					refreshing: false,
				});
			}
		} catch (error) {
			this.setState({ loading: false, error: true, refreshing: false });
		}
	}

	_handleLoadMore = () => {
		const { page, totalPages } = this.state;

		if (page < totalPages) {
			this.setState({ page: page + 1 }, () => this.getAllCrops());
		}
	};

	_onRefresh = () => {
		this.setState({ refreshing: true, page: 1, totalPages: 1 }, () => this.getAllCrops());
	};

	_renderFooter = () => {
		const { page, totalPages } = this.state;

		if (page === totalPages) return null;

		return (
			<View style={{ flex: 1 }}>
				<ActivityIndicator size='large' color={Color.mainColor} />
			</View>
		);
	};

	_updateCropList = crop => {
		if (crop) {
			const uploadedCrop = [crop];
			this.setState(prevState => ({
				crops: [...uploadedCrop, ...prevState.crops],
			}));
		}
	};

	_showTradingInfo = () =>
		this.props.navigation.navigate('TradingInfo', {
			updateCropList: this._updateCropList,
		});

	_goBack = () => this.props.navigation.goBack();

	_openNearMe = () => this.props.navigation.navigate('NearMe');

	_goToProfile = () =>
		this.props.navigation.navigate('Profile', {
			user: this.props.navigation.state.params.user,
		});

	_renderAccordionHeader = item => {
		const date = new Date(item.createdAt);
		return (
			<View
				style={{
					height: 50,
					backgroundColor: '#f2f2f2',
					justifyContent: 'center',
					borderWidth: StyleSheet.hairlineWidth,
				}}
				key={item._id}>
				<Text style={{ paddingLeft: 10 }}>{date.toLocaleDateString()}</Text>
			</View>
		);
	};

	_renderAccordionBody = item => {
		return (
			<View style={{ paddingLeft: 20 }} key={item._id}>
				<Item>
					<Text>Crop Type : </Text>
					<Text>{item.cropType}</Text>
				</Item>
				<Item>
					<Text>Quantity : </Text>
					<Text>{item.quantity + ' kg'}</Text>
				</Item>
				{item.media && (
					<Item style={{ justifyContent: 'center', padding: 10 }}>
						<Image
							style={{ width: 120, height: 120 }}
							source={{
								uri: baseUrl + '/crops/media/' + item.media._id + '/' + item.media.name,
							}}
						/>
					</Item>
				)}
			</View>
		);
	};

	_keyExtractor = (crop, index) => crop._id + index;

	_setRef = ref => (this.flatListRef = ref);

	_renderNoCrops = () => {
		return (
			<View style={styles.centerContent}>
				<Icon name='ios-paper' color='black' style={{ fontSize: 40 }} />
				<Text style={styles.blackText}>No crop list to show !</Text>
			</View>
		);
	};

	render() {
		const { crops, error, loading, refreshing } = this.state;
		const { showAddButton } = this.props.navigation.state.params;

		return (
			<Container>
				<Header style={{ backgroundColor: Color.mainColor }}>
					<Left>
						<Button transparent onPress={this._goBack}>
							<Icon name='arrow-back' />
						</Button>
					</Left>
					<Body>
						{LoggedUserCredentials.getUserType() === 'FARMER' ? (
							<Title>Selling Info List</Title>
						) : (
							<Title>Buying Info List</Title>
						)}
					</Body>

					{showAddButton ? (
						<Right>
							<Button transparent onPress={this._showTradingInfo}>
								<Icon name='ios-add-circle-outline' />
							</Button>
						</Right>
					) : (
						<Right>
							<Button transparent onPress={this._goToProfile}>
								<RNText style={styles.transactStyle}>Transact</RNText>
							</Button>
						</Right>
					)}
				</Header>

				<View style={{ flex: 1 }}>
					{loading ? (
						<View style={styles.centerContent}>
							<ActivityIndicator color={Color.mainColor} size='large' />
						</View>
					) : error ? (
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
						<AccordionList
							list={crops}
							contentContainerStyle={{ flexGrow: 1 }}
							header={this._renderAccordionHeader}
							body={this._renderAccordionBody}
							keyboardShouldPersistTaps='handled'
							keyboardDismissMode='on-drag'
							keyExtractor={this._keyExtractor}
							ListEmptyComponent={this._renderNoCrops}
							refreshing={refreshing}
							onRefresh={this._onRefresh}
							ListFooterComponent={this._renderFooter}
							onEndReached={this._handleLoadMore}
							onEndReachedThreshold={0.5}
						/>
					)}
				</View>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	transactStyle: {
		color: '#fff',
		fontSize: 17,
	},
	centerContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	blackText: {
		color: 'black',
	},
});
