import React, { Component } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';

import { Container, Header, Left, Button, Icon, Body, Title, Right } from 'native-base';

import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import io from 'socket.io-client/dist/socket.io';

import CustomActions from './CustomActions';
import CustomView from './CustomView';

import Color from '../../theme/Colors';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';
import { baseUrl, chatUrl, userUrl } from '../../utils/global';

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
			loadingEarlier: false,
			hasEarlierMessage: true,
			page: 1,
		};

		this.chat_socket = io(baseUrl + '/all_chats');
	}

	_isMounted = false;

	componentDidMount() {
		this._isMounted = true;
		this.chat_socket.on('chat::created', this._onChatMessageReceived);
		this.setState({ loading: true }, () => this.getMessages());
	}

	componentWillUnmount() {
		this._isMounted = false;
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

	_onLoadEarlier = async () => {
		const { page } = this.state;

		const nextPage = page + 1;

		this.setState({ page: nextPage, loadingEarlier: true }, this.getEarlierMessage);
	};

	getEarlierMessage = async () => {
		const { page } = this.state;

		const {
			selectedGroup: {
				chatType,
				user: { _id },
				roomId,
			},
		} = this.props.navigation.state.params.data;

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

		try {
			let res = await fetch(url, config);

			if (res.status === 200) {
				const earlier_msgs = await res.json();

				if (earlier_msgs.length > 0 && this._isMounted === true) {
					this.setState(preState => ({
						messages: GiftedChat.prepend(preState.messages, earlier_msgs, Platform.OS !== 'web'),
						loadingEarlier: false,
						hasEarlierMessage: true,
					}));
				}
			}
		} catch (error) {
			console.log(error);
			this.setState({ loadingEarlier: false });
		}

		fetch(url, config)
			.then(res => res.json())
			.then(resJson => {
				this.setState({ error: false, messages: resJson, loadingEarlier: false });
			})
			.catch(err => this.setState({ error: true, loadingEarlier: false }));
	};

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
				messages: GiftedChat.append(previousState.messages, msgs, Platform.OS !== 'web'),
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

	_renderCustomActions = props => <CustomActions {...props} onSend={this._onSend} />;

	_renderBubble = props => {
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					left: {
						backgroundColor: '#f0f0f0',
					},
				}}
			/>
		);
	};

	_renderLoadingView = () => {
		return (
			<View style={styles.centerContent}>
				<ActivityIndicator size='large' color={Color.mainColor} />
			</View>
		);
	};

	_renderCustomView(props) {
		return <CustomView {...props} />;
	}

	_parsePatterns = linkStyle => {
		return [
			{
				pattern: /#(\w+)/,
				style: { textDecorationLine: 'underline', color: 'darkorange' },
			},
		];
	};

	render() {
		const { selectedGroup } = this.props.navigation.state.params.data;
		const { messages, loading, loadingEarlier, hasEarlierMessage } = this.state;

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
					loadEarlier
					onLoadEarlier={this._onLoadEarlier}
					isLoadingEarlier={loadingEarlier}
					parsePatterns={this._parsePatterns}
					user={currentUser}
					showUserAvatar
					showAvatarForEveryMessage
					scrollToBottom
					keyboardShouldPersistTaps='never'
					renderActions={this._renderCustomActions}
					renderBubble={this._renderBubble}
					renderCustomView={this._renderCustomView}
					inverted={Platform.OS !== 'web'}
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
