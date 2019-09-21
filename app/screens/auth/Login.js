import React, { Component } from 'react';
import {
	ScrollView,
	Image,
	StyleSheet,
	ActivityIndicator,
	AsyncStorage,
} from 'react-native';

import {
	Content,
	Button,
	Item,
	Input,
	Form,
	Text,
	Picker,
	Icon,
} from 'native-base';

import md5 from 'react-native-md5';

import imageLogo from '../../assets/images/logo.png';

import Color from '../../theme/Colors';
import { loginUrl } from '../../utils/global';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';

export class Login extends Component {
	state = {
		email: '',
		password: '',
		userType: 'key0',
		isLoggingIn: false,
		errorText: '',
	};

	_validateSignIn = () => {
		const { email, password, userType } = this.state;

		const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

		if (userType === 'key0') {
			this.setState({ errorText: 'Please select user type.' });
		} else if (email.trim().length === 0) {
			this.setState({ errorText: 'Please enter email.' });
		} else if (reg.test(email) === false) {
			this.setState({ errorText: 'Please enter valid email.' });
		} else if (password.trim().length === 0) {
			this.setState({ errorText: 'Please enter password.' });
		} else {
			this.setState({ isLoggingIn: true, errorText: '' }, () =>
				this._tryToSignIn(),
			);
		}
	};

	async _tryToSignIn() {
		const { email, password, userType } = this.state;

		const data = {
			email,
			password: md5.hex_md5(password),
			userType,
		};

		const config = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		};

		try {
			const res = await fetch(loginUrl, config);

			if (res.status == 401) {
				this.setState({
					isLoggingIn: false,
					errorText: 'Login fail.Try again!',
				});
			} else if (res.status == 200) {
				const resJson = await res.json();

				const accessTokenArray = ['accessToken', resJson.token];
				const userIdArray = ['userId', resJson.userId];
				const userNameArray = ['userName', resJson.name];
				const userTypeArray = ['userType', resJson.userType];

				LoggedUserCredentials.setLoggedUserData(
					resJson.token,
					resJson.name,
					resJson.userId,
					resJson.userType,
				);

				await AsyncStorage.multiSet([
					accessTokenArray,
					userIdArray,
					userNameArray,
					userTypeArray,
				]);

				this.setState({ isLoggingIn: false }, () =>
					this.props.navigation.navigate('Home'),
				);
			} else {
				const errorText = 'Something Wrong.Try Again!';
				this.setState({ isLoggingIn: false, errorText });
			}
		} catch (error) {
			const errorText = 'Please connect to internet!';
			this.setState({ isLoggingIn: false, errorText });
		}
	}

	_goToSignup = () => this.props.navigation.navigate('SignUp');

	onUserTypeChange = userType => this.setState({ userType });

	onEmailChange = email => this.setState({ email });

	onPasswordChange = password => this.setState({ password });

	render() {
		const {
			userType,
			email,
			password,
			isLoggingIn,
			errorText,
		} = this.state;

		return (
			<ScrollView style={styles.container}>
				<Content>
					<Image source={imageLogo} style={styles.logo} />

					<Form style={{ paddingRight: 15 }}>
						<Item picker style={{ marginLeft: 15 }}>
							<Picker
								mode='dropdown'
								iosIcon={<Icon name='arrow-down' />}
								style={{ width: undefined }}
								placeholderStyle={{ color: '#bfc6ea' }}
								placeholderIconColor='#007aff'
								selectedValue={userType}
								onValueChange={this.onUserTypeChange}>
								<Picker.Item
									label='Select User Type'
									value='key0'
								/>
								<Picker.Item label='Farmer' value='FARMER' />
								<Picker.Item
									label='Middleman'
									value='MIDDLEMAN'
								/>
							</Picker>
						</Item>

						<Item>
							<Input
								value={email}
								placeholder='Email'
								onChangeText={this.onEmailChange}
								keyboardType='email-address'
							/>
						</Item>

						<Item>
							<Input
								value={password}
								placeholder='Password'
								secureTextEntry
								onChangeText={this.onPasswordChange}
							/>
						</Item>
					</Form>

					{errorText.trim().length > 0 ? (
						<Text style={styles.errorText}>{errorText}</Text>
					) : (
						<Text style={styles.errorText} />
					)}

					<Button
						block
						style={styles.signinBtn}
						onPress={this._validateSignIn}
						disabled={isLoggingIn}>
						{isLoggingIn ? (
							<ActivityIndicator color='#fff' />
						) : (
							<Text>Sign In</Text>
						)}
					</Button>

					<Text style={styles.bottomText}>
						<Text>Don't have an account? </Text>
						<Text
							style={styles.signupBtn}
							onPress={this._goToSignup}>
							Sign up now
						</Text>
					</Text>
				</Content>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	logo: {
		flex: 1,
		width: 200,
		height: 280,
		resizeMode: 'contain',
		alignSelf: 'center',
	},
	signinBtn: {
		margin: 15,
		backgroundColor: Color.mainColor,
	},
	bottomText: {
		textAlign: 'center',
	},
	signupBtn: {
		fontSize: 17,
		fontWeight: '500',
	},
	errorText: {
		color: 'red',
		fontSize: 17,
		textAlign: 'right',
		paddingRight: 17,
		textAlignVertical: 'center',
		height: 40,
	},
});
