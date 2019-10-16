import React, { Component } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import { Container, Header, Left, Button, Icon, Body, Title, Right } from 'native-base';

import { GiftedChat } from 'react-native-gifted-chat';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import Color from '../../theme/Colors';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';

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
	state = {
		messages: [],
	};

	componentDidMount() {}

	close = () => this.props.navigation.goBack();

	onSend = (messages = []) => {
		this.setState(previousState => ({
			messages: GiftedChat.append(previousState.messages, messages),
		}));
	};

	renderCustomView = props => {
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
		const { messages } = this.state;

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

				<ScrollView contentContainerStyle={styles.chatContainer}>
					<GiftedChat
						messages={messages}
						onSend={this.onSend}
						renderCustomView={this.renderCustomView}
						user={{ _id: LoggedUserCredentials.getUserId() }}
					/>
				</ScrollView>
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
});
