import React, { Component } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';

import { Container, Left, Body, Right, Button, Icon, Header, Title, Text } from 'native-base';

import MessageItem from './MessageItem';

import Color from '../../theme/Colors';

import { userUrl } from '../../utils/global';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';

export class MessageContainer extends Component {
	state = {
		chatRooms: [],
		loading: false,
		refreshing: false,
		isError: false,
	};

	componentDidMount() {
		this.setState({ loading: true }, this.getAllChatRooms);
	}

	getAllChatRooms = async () => {
		const path = userUrl + '/' + LoggedUserCredentials.getUserId() + '/chatrooms';

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
					refreshing: false,
					isError: false,
					chatRooms: resJson,
				});
			} else if (res.status == 500) {
				this.setState({ loading: false, isError: true, refreshing: true });
			}
		} catch (error) {
			this.setState({ loading: false, isError: true, refreshing: true });
		}
	};

	close = () => this.props.navigation.goBack();

	renderEmptyView = () => {
		return (
			<View style={styles.centerContent}>
				<Icon name='ios-chatbubbles' color='black' style={{ fontSize: 40 }} />
				<Text>No Chat History !</Text>
			</View>
		);
	};

	_keyExtractor = (chat, index) => chat._id + index;

	goToChatScreen = selectedGroup => {
		const data = {
			selectedGroup,
		};

		this.props.navigation.navigate('Chat', { data });
	};

	_onRefresh = () => {
		this.setState({ refreshing: true }, this.getAllChatRooms);
	};

	_renderItem = ({ item }) => {
		return <MessageItem room={item} gotoChatScreen={this.goToChatScreen} />;
	};

	tapToRetryBtnPress = () => {
		this.setState({ loading: true, isError: false });
		setTimeout(this.getAllChatRooms, 1000);
	};

	render() {
		const { chatRooms, loading, isError, refreshing } = this.state;

		return (
			<Container>
				<Header style={styles.header}>
					<Left>
						<Button transparent onPress={this.close}>
							<Icon name='arrow-back' style={styles.whiteColor} />
						</Button>
					</Left>
					<Body>
						<Title style={styles.whiteColor}>Messages</Title>
					</Body>
					<Right />
				</Header>

				{loading ? (
					<View style={styles.centerContent}>
						<ActivityIndicator color={Color.mainColor} size='large' />
					</View>
				) : isError ? (
					<View style={styles.centerContent}>
						<TouchableOpacity onPress={this.tapToRetryBtnPress}>
							<View style={{ alignItems: 'center' }}>
								<Icon name='ios-wifi' color='black' style={{ fontSize: 40 }} />
								<Text>No Internet To Connect !</Text>
								<Text> Tap To Retry </Text>
							</View>
						</TouchableOpacity>
					</View>
				) : (
					<FlatList
						contentContainerStyle={{ flexGrow: 1 }}
						keyboardShouldPersistTaps='handled'
						keyboardDismissMode='on-drag'
						ListEmptyComponent={this.renderEmptyView}
						data={chatRooms}
						renderItem={this._renderItem}
						keyExtractor={this._keyExtractor}
						style={styles.container}
						refreshing={refreshing}
						onRefresh={this._onRefresh}
					/>
				)}
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	header: {
		backgroundColor: Color.mainColor,
	},
	centerContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		padding: 8,
	},
	whiteColor: {
		color: 'white',
	},
});
