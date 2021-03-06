import React, { Component } from 'react';
import { ScrollView, Image, StyleSheet, ActivityIndicator, AsyncStorage, Platform } from 'react-native';

import { Button, Item, Input, Form, Text, Picker, Icon, View, CheckBox, ListItem, Body } from 'native-base';

import SegmentedControlTab from 'react-native-segmented-control-tab';
import md5 from 'react-native-md5';
import ph_checker from 'myanmar-phonenumber';
import { withTranslation } from 'react-i18next';

import imageLogo from '../../assets/images/logo.png';

import Color from '../../theme/Colors';
import { loginUrl } from '../../utils/global';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';

class LoginScreen extends Component {
	state = {
		ph_no: '',
		password: '',
		userType: 'key0',
		isLoggingIn: false,
		errorText: '',
		selectedIndex: this.props.i18n.language == 'en' ? 0 : 1,
		isPermitted: true,
	};

	_validateSignIn = () => {
		const { ph_no, password, userType, isPermitted } = this.state;
		const { t } = this.props;

		if (!isPermitted) {
			this.setState({ errorText: t('errors:agree_permission') });
		} else if (userType === 'key0') {
			this.setState({ errorText: t('errors:select_user_type') });
		} else if (ph_no.trim().length === 0) {
			this.setState({ errorText: t('errors:enter_ph_no') });
		} else if (!ph_checker.isValidMMPhoneNumber(ph_no)) {
			this.setState({ errorText: t('errors:enter_valid_ph_no') });
		} else if (password.trim().length === 0) {
			this.setState({ errorText: t('errors:enter_password') });
		} else {
			this.setState({ isLoggingIn: true, errorText: '' }, () => this._tryToSignIn());
		}
	};

	async _tryToSignIn() {
		const { ph_no, password, userType } = this.state;
		const { t } = this.props;

		const data = {
			phno: ph_no,
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
				const lngArray = ['lng', LoggedUserCredentials.getLanguage()];

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
					lngArray,
				]);

				this.setState({ isLoggingIn: false }, () => this.props.navigation.navigate('Home'));
			} else {
				const errorText = t('errors:500_error');
				this.setState({ isLoggingIn: false, errorText });
			}
		} catch (error) {
			console.log(error);
			const errorText = t('errors:no_internet');
			this.setState({ isLoggingIn: false, errorText });
		}
	}

	_goToSignup = () => this.props.navigation.navigate('SignUp');

	onUserTypeChange = userType => this.setState({ userType });

	onPhNoChange = ph_no => this.setState({ ph_no });

	onPasswordChange = password => this.setState({ password });

	onLanguageChange = index => this.setState({ selectedIndex: index }, this._changeLanguage);

	_changeLanguage = () => {
		const { selectedIndex } = this.state;

		if (selectedIndex == 0) {
			this.props.i18n.changeLanguage('en');
			LoggedUserCredentials.setLanguage('en');
		} else {
			this.props.i18n.changeLanguage('my');
			LoggedUserCredentials.setLanguage('my');
		}
	};

	onCheckBoxPressed = () => this.setState({ isPermitted: !this.state.isPermitted });

	render() {
		const { userType, ph_no, password, isLoggingIn, errorText, selectedIndex, isPermitted } = this.state;
		const { t } = this.props;

		return (
			<ScrollView
				style={styles.container}
				keyboardShouldPersistTaps='handled'
				keyboardDismissMode='on-drag'>
				<View>
					<View style={styles.switchContainer}>
						<SegmentedControlTab
							tabsContainerStyle={segStyle.tabsContainerStyle}
							tabStyle={segStyle.tabStyle}
							firstTabStyle={segStyle.firstTabStyle}
							lastTabStyle={segStyle.lastTabStyle}
							tabTextStyle={segStyle.tabTextStyle}
							activeTabStyle={segStyle.activeTabStyle}
							activeTabTextStyle={segStyle.activeTabTextStyle}
							values={['English', 'မြန်မာ']}
							selectedIndex={selectedIndex}
							onTabPress={this.onLanguageChange}
						/>
					</View>

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
								value={ph_no}
								placeholder={t('common:ph_no')}
								onChangeText={this.onPhNoChange}
								keyboardType='phone-pad'
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

					<ListItem noBorder>
						<CheckBox
							checked={isPermitted}
							color={Color.mainColor}
							onPress={this.onCheckBoxPressed}
						/>
						<Body>
							<Text style={{ fontSize: 13 }}>{t('login:permission')}</Text>
						</Body>
					</ListItem>

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
				</View>
			</ScrollView>
		);
	}
}

const Login = withTranslation(['login, errors', 'common'])(LoginScreen);

export { Login };

const segStyle = StyleSheet.create({
	tabsContainerStyle: {
		borderColor: Color.mainColor,
	},
	tabStyle: {
		borderRadius: 1,
	},
	firstTabStyle: {
		borderColor: Color.mainColor,
	},
	lastTabStyle: {
		borderColor: Color.mainColor,
	},
	tabTextStyle: {
		color: Color.mainColor,
	},
	activeTabStyle: {
		backgroundColor: Color.mainColor,
	},
	activeTabTextStyle: {
		color: '#fff',
	},
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	logo: {
		flex: 1,
		width: 200,
		height: Platform.OS === 'android' ? 200 : 240,
		resizeMode: 'contain',
		alignSelf: 'center',
		marginTop: 50,
	},
	signinBtn: {
		marginVertical: 10,
		marginHorizontal: 15,
		backgroundColor: Color.mainColor,
	},
	bottomText: {
		textAlign: 'center',
	},
	signupBtn: {
		fontSize: 16,
		fontWeight: '500',
	},
	errorText: {
		color: 'red',
		fontSize: 17,
		textAlign: 'right',
		paddingRight: 17,
		textAlignVertical: 'center',
		height: 30,
	},
	switchContainer: {
		paddingTop: Platform.OS === 'android' ? 20 : 30,
		position: 'absolute',
		zIndex: 999,
		width: '60%',
		alignSelf: 'center',
	},
});
