import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import {
	Container,
	Left,
	Body,
	Right,
	Button,
	Icon,
	Header,
	Title,
	Content,
	List,
	ListItem,
	Thumbnail,
	Text,
} from 'native-base';

import Colors from '../../theme/Colors';

const sankhadeep = require('../../assets/contacts/sankhadeep.png');
const supriya = require('../../assets/contacts/supriya.png');
const himanshu = require('../../assets/contacts/himanshu.png');
const shweta = require('../../assets/contacts/shweta.png');
const shruti = require('../../assets/contacts/shruti.png');
const shivraj = require('../../assets/contacts/shivraj.png');

const datas = [
	{
		img: sankhadeep,
		text: 'Sankhadeep',
		note: 'Hello',
		time: '3:00 pm',
	},
	{
		img: supriya,
		text: 'Supriya',
		note: 'Hi ',
		time: '4:00 pm',
	},
	{
		img: shivraj,
		text: 'Shivraj',
		note: 'How are you ?',
		time: '5:00 pm',
	},
	{
		img: shruti,
		text: 'Shruti',
		note: 'Long time no see !!',
		time: '6:00 am',
	},
	{
		img: himanshu,
		text: 'Himanshu',
		note: 'Good morning',
		time: 'just now',
	},
	{
		img: shweta,
		text: 'Shweta',
		note: 'I am fine.',
		time: 'yesterday',
	},
];

export class MessageContainer extends Component {
	state = {
		users: [],
	};

	close = () => this.props.navigation.goBack();

	goToChat(param) {
		const data = {
			title: param.text,
		};

		this.props.navigation.navigate('Chat', { data });
	}

	render() {
		const { users } = this.state;

		return (
			<Container>
				<Header style={styles.header}>
					<Left>
						<Button transparent onPress={this.close}>
							<Icon name='arrow-back' />
						</Button>
					</Left>
					<Body>
						<Title>Messages</Title>
					</Body>
					<Right />
				</Header>

				<Content>
					<List
						dataArray={datas}
						renderRow={data => (
							<ListItem
								thumbnail
								onPress={() => this.goToChat(data)}>
								<Left>
									<Thumbnail source={data.img} />
								</Left>
								<Body>
									<Text>{data.text}</Text>
									<Text numberOfLines={1} note>
										{data.note}
									</Text>
								</Body>
								<Right>
									<Text note>{data.time}</Text>
								</Right>
							</ListItem>
						)}
					/>
				</Content>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	header: {
		backgroundColor: Colors.mainColor,
	},
});
