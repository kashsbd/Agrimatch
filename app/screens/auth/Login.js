import React, { Component } from 'react';
import { ScrollView, Image, StyleSheet, ActivityIndicator, AsyncStorage } from 'react-native';

import { Content, Button, Item, Input, Form, Text, Picker, Icon } from 'native-base';

import { Switch } from 'react-native-switch';
import md5 from 'react-native-md5';
import { withTranslation } from 'react-i18next';

import imageLogo from '../../assets/images/logo.png';

import Color from '../../theme/Colors';
import { loginUrl } from '../../utils/global';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';

class LoginScreen extends Component {
	state = {
		email: '',
		password: '',
		userType: 'key0',
		isLoggingIn: false,
		errorText: '',
		isEng: true,
	};

	_validateSignIn = () => {
		const { email, password, userType } = this.state;
		const { t } = this.props;

		const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

		if (userType === 'key0') {
			this.setState({ errorText: t('errors:select_user_type') });
		} else if (email.trim().length === 0) {
			this.setState({ errorText: t('errors:enter_email') });
		} else if (reg.test(email) === false) {
			this.setState({ errorText: t('errors:enter_valid_email') });
		} else if (password.trim().length === 0) {
			this.setState({ errorText: t('errors:enter_password') });
		} else {
			this.setState({ isLoggingIn: true, errorText: '' }, () => this._tryToSignIn());
		}
	};

	async _tryToSignIn() {
		const { email, password, userType } = this.state;
		const { t } = this.props;

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
					errorText: t('errors:login_fail'),
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

				await AsyncStorage.multiSet([accessTokenArray, userIdArray, userNameArray, userTypeArray]);

				this.setState({ isLoggingIn: false }, () => this.props.navigation.navigate('Home'));
			} else {
				const errorText = t('errors:500_error');
				this.setState({ isLoggingIn: false, errorText });
			}
		} catch (error) {
			const errorText = t('errors:no_internet');
			this.setState({ isLoggingIn: false, errorText });
		}
	}

	_goToSignup = () => this.props.navigation.navigate('SignUp');

	onUserTypeChange = userType => this.setState({ userType });

	onEmailChange = email => this.setState({ email });

	onPasswordChange = password => this.setState({ password });

	onLanguageChange = lan => this.setState({ isEng: lan });

	_renderInsideCircle = () => {
		return <Text>mm</Text>;
	};

	render() {
		const { userType, email, password, isLoggingIn, errorText, isEng } = this.state;

		const { t } = this.props;

		return (
			<ScrollView style={styles.container}>
				<Content>
					<Switch
						style={{ alignSelf: 'flex-end', margin: 10, backgroundColor: 'red' }}
						value={isEng}
						onValueChange={this.onLanguageChange}
						disabled={false}
						activeText='eng'
						inActiveText='mm'
						circleSize={50}
						barHeight={1}
						circleBorderWidth={3}
						backgroundActive={Color.mainColor}
						backgroundInactive='gray'
						circleActiveColor='#30a566'
						circleInActiveColor='#000000'
						changeValueImmediately={true}
						renderInsideCircle={this._renderInsideCircle}
						changeValueImmediately={true}
						innerCircleStyle={{ alignItems: 'center', justifyContent: 'center', margin: 50 }}
						outerCircleStyle={{}}
						renderActiveText={true}
						renderInActiveText={true}
						switchLeftPx={2}
						switchRightPx={2}
						switchWidthMultiplier={2}
						switchBorderRadius={30}
					/>

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
								<Picker.Item label={t('common:select_user_type')} value='key0' />
								<Picker.Item label={t('common:farmer_label')} value='FARMER' />
								<Picker.Item label={t('common:middleman_label')} value='MIDDLEMAN' />
							</Picker>
						</Item>

						<Item>
							<Input
								value={email}
								placeholder={t('common:email')}
								onChangeText={this.onEmailChange}
								keyboardType='email-address'
							/>
						</Item>

						<Item>
							<Input
								value={password}
								placeholder={t('common:password')}
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
						{isLoggingIn ? <ActivityIndicator color='#fff' /> : <Text>{t('login:sign_in')}</Text>}
					</Button>

					<Text style={styles.bottomText}>
						<Text>{t("login:don't_have_account")} </Text>
						<Text style={styles.signupBtn} onPress={this._goToSignup}>
							{t('login:sign_up_now')}
						</Text>
					</Text>
				</Content>
			</ScrollView>
		);
	}
}

const Login = withTranslation(['login, errors', 'common'])(LoginScreen);

export { Login };

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
