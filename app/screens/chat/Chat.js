import React, { Component } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

import { Container, Header, Left, Button, Icon, Body, Title, Right } from 'native-base';

import { GiftedChat } from 'react-native-gifted-chat';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import io from 'socket.io-client/dist/socket.io';

import Color from '../../theme/Colors';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';
import { baseUrl, chatUrl } from '../../utils/global';

const msgs = [
	{
		_id: Math.round(Math.random() * 1000000),
		text: 'awesome',
		createdAt: new Date(),
		user: {
			_id: 1,
			name: 'Developer',
		},
	},
	{
		_id: Math.round(Math.random() * 1000000),
		text: '',
		createdAt: new Date(),
		user: {
			_id: 2,
			name: 'React Native',
		},
		image: 'http://www.pokerpost.fr/wp-content/uploads/2017/12/iStock-604371970-1.jpg',
		sent: true,
		received: true,
	},
	{
		_id: Math.round(Math.random() * 1000000),
		text: 'Send me a picture!',
		createdAt: new Date(),
		user: {
			_id: 1,
			name: 'Developer',
		},
	},
	{
		_id: Math.round(Math.random() * 1000000),
		text: '',
		createdAt: new Date(),
		user: {
			_id: 2,
			name: 'React Native',
		},
		sent: true,
		received: true,
		location: {
			latitude: 48.864601,
			longitude: 2.398704,
		},
	},
	{
		_id: Math.round(Math.random() * 1000000),
		text: 'Where are you?',
		createdAt: new Date(),
		user: {
			_id: 1,
			name: 'Developer',
		},
	},
	{
		_id: Math.round(Math.random() * 1000000),
		text: 'Yes, and I use AgriMatch!',
		createdAt: new Date(),
		user: {
			_id: 2,
			name: 'React Native',
		},
		sent: true,
		received: true,
	},
	{
		_id: Math.round(Math.random() * 1000000),
		text: 'Are you building a chat app?',
		createdAt: new Date(),
		user: {
			_id: 1,
			name: 'Developer',
		},
	},
	{
		_id: Math.round(Math.random() * 1000000),
		text: 'You are officially rocking AgriMatch.',
		createdAt: new Date(),
		system: true,
	},
];

export class Chat extends Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: [],
			loading: false,
			page: 1,
		};

		this.chat_socket = io(baseUrl + '/all_chats');
	}

	componentDidMount() {
		this.chat_socket.on('chat::created', this._onChatMessageReceived);
		this.setState({ loading: true }, () => this.getMessages());
	}

	getMessages() {
		const {
			selectedGroup: {
				chatType,
				user: { _id },
				roomId,
			},
		} = this.props.navigation.state.params.data;
		const { page } = this.state;

		const dataQueryString =
			'?page=' +
			page +
			'&roomId=' +
			roomId +
			'&fromSenderId=' +
			LoggedUserCredentials.getUserId() +
			'&toReceiverId=' +
			_id +
			'&roomType=' +
			chatType;

		const config = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + LoggedUserCredentials.getAccessToken(),
			},
			method: 'GET',
		};

		const url = chatUrl + '/messages/' + dataQueryString;

		fetch(url, config)
			.then(res => res.json())
			.then(resJson => {
				this.setState({ loading: false, error: false, messages: resJson });
			})
			.catch(err => this.setState({ loading: false, error: true }));
	}

	componentWillUnmount() {
		this.chat_socket.off('chat::created', this._onChatMessageReceived);
	}

	close = () => this.props.navigation.goBack();

	_onChatMessageReceived = message => {
		const {
			selectedGroup: {
				user: { _id },
				roomId,
			},
		} = this.props.navigation.state.params.data;

		if (roomId) {
			if (
				message.meta.room_id === roomId &&
				message.meta.toReceiverId === LoggedUserCredentials.getUserId()
			) {
				this.setState(
					previousState => ({
						messages: GiftedChat.append(previousState.messages, [message]),
					}),
					() => this._notifySeenMsg(message._id),
				);
			}
		} else {
			if (message.user._id === _id && message.meta.toReceiverId === LoggedUserCredentials.getUserId()) {
				this.setState(
					previousState => ({
						messages: GiftedChat.append(previousState.messages, [message]),
					}),
					() => this._notifySeenMsg(message._id),
				);
			}
		}
	};

	_notifySeenMsg(msgId) {
		const data = {
			userId: LoggedUserCredentials.getUserId(),
			msgId,
		};

		const config = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + LoggedUserCredentials.getAccessToken(),
			},
			method: 'POST',
			body: JSON.stringify(data),
		};

		const url = chatUrl + '/notifyChatMessage';

		fetch(url, config)
			.then(res => res.json())
			.catch(err => alert(err));
	}

	_onSend = (msgs = []) => {
		this.setState(
			previousState => ({
				messages: GiftedChat.append(previousState.messages, msgs),
			}),
			() => this._sendMessage(msgs),
		);
	};

	_sendMessage(msgs) {
		const {
			selectedGroup: {
				chatType,
				user: { _id },
				roomId,
			},
		} = this.props.navigation.state.params.data;

		let chat_data = {
			fromSenderId: LoggedUserCredentials.getUserId(),
			toReceiverId: _id,
			text: msgs[0].text,
			roomType: chatType,
		};

		if (roomId) {
			chat_data['roomId'] = roomId;
		}

		const config = {
			headers: {
				Authorization: 'Bearer ' + LoggedUserCredentials.getAccessToken(),
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify(chat_data),
		};

		fetch(chatUrl, config)
			.then(res => res.json())
			.catch(err => console.log(err));
	}

	_renderLoadingView = () => {
		return (
			<View style={styles.centerContent}>
				<ActivityIndicator size='large' color={Color.mainColor} />
			</View>
		);
	};

	_renderCustomView = props => {
		const { currentMessage, containerStyle } = props;

		if (currentMessage.location) {
			return (
				<View style={containerStyle}>
					<MapView
						provider={PROVIDER_GOOGLE}
						style={[styles.mapView]}
						region={{
							latitude: currentMessage.location.coordinates[1],
							longitude: currentMessage.location.coordinates[0],
							latitudeDelta: 0.1,
							longitudeDelta: 0.1,
						}}
						scrollEnabled={false}
						zoomEnabled={false}
					/>
				</View>
			);
		}
		return null;
	};

	render() {
		const { selectedGroup } = this.props.navigation.state.params.data;
		const { messages, loading } = this.state;

		const currentUser = {
			_id: LoggedUserCredentials.getUserId(),
			name: LoggedUserCredentials.getUserName(),
		};

		return (
			<Container>
				<Header style={styles.header}>
					<Left>
						<Button transparent onPress={this.close}>
							<Icon name='arrow-back' />
						</Button>
					</Left>
					<Body>
						<Title>{selectedGroup.user.name}</Title>
					</Body>
					<Right />
				</Header>

				<GiftedChat
					messages={messages}
					onSend={this._onSend}
					user={currentUser}
					showUserAvatar
					showAvatarForEveryMessage
					isLoadingEarlier={loading}
					renderCustomView={this._renderCustomView}
					renderLoading={this._renderLoadingView}
				/>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	header: {
		backgroundColor: Color.mainColor,
	},
	mapView: {
		width: 150,
		height: 100,
		borderRadius: 13,
		margin: 3,
	},
	chatContainer: {
		flex: 1,
	},
	centerContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
