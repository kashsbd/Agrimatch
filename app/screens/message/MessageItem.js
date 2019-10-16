import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import io from 'socket.io-client';

import { Left, Body, Right, ListItem, Thumbnail, Text } from 'native-base';

import LoggedUserCredentials from '../../models/LoggedUserCredentials';
import { baseUrl, userUrl } from '../../utils/global';

const _ = require('lodash');

export default class MessageItem extends PureComponent {
	lastMessage;

	constructor(props) {
		super(props);
		this.lastMessage = props.room.lastMessage;

		this.state = {
			message: this.lastMessage.message,
			saw_message: this.lastMessage
				? this.lastMessage.seenBy.includes(LoggedUserCredentials.getUserId())
				: false,
		};

		this.chat_socket = io(baseUrl + '/all_chats');
	}

	componentDidMount() {
		this.chat_socket.on('chat::created', this._onChatMessageReceived);
	}

	componentWillUnmount() {
		this.chat_socket.off('chat::created', this._onChatMessageReceived);
	}

	_onChatMessageReceived = data => {
		const { room } = this.props;

		if (data.meta.room_id === room._id && data.meta.toReceiverId === LoggedUserCredentials.getUserId()) {
			this.setState({ message: data.text, saw_message: false });
		}
	};

	gotoChatScreen = () => {
		this.setState({ saw_message: true });

		const { room, gotoChatScreen } = this.props;
		this.notifyChatMessage();

		let toReceiver;

		const index = _.findIndex(room.participants, { _id: LoggedUserCredentials.getUserId() });

		if (index === 0) {
			toReceiver = room.participants[1];
		} else if (index === 1) {
			toReceiver = room.participants[0];
		}

		const data = {
			toReceiverId: toReceiver._id,
			roomId: room._id,
			title: toReceiver.name,
		};

		gotoChatScreen(data, this.refreshNotiBadge);
	};

	refreshNotiBadge = () => {
		this.setState({ saw_message: true });
	};

	notifyChatMessage() {
		const { saw_message } = this.state;

		if (!saw_message) {
			const data = {
				ownerId: LoggedUserCredentials.getUserId(),
				chatId: this.lastMessage._id,
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
	}

	render() {
		const { room } = this.props;

		const { message } = this.state;

		let fromSender;

		const index = _.findIndex(room.participants, { _id: LoggedUserCredentials.getUserId() });

		if (index === 0) {
			fromSender = conversation.participants[1];
		} else if (index === 1) {
			fromSender = conversation.participants[0];
		}

		const propic_url = userUrl + '/' + fromSender._id + '/profile_pic';

		return (
			<ListItem thumbnail onPress={this.navigate(item)} button onPress={this.gotoChatScreen}>
				<Left>
					<Thumbnail source={data.img} />
				</Left>
				<Body>
					<Text>{fromSender.name}</Text>
					<Text numberOfLines={1} note>
						{message}
					</Text>
				</Body>
				<Right>
					<Text note>{data.time}</Text>
				</Right>
			</ListItem>
		);
	}
}
