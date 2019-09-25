import React, { Component } from 'react';
import { ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';

import { Content, Button, Item, Input, Form, Text, Picker, Icon } from 'native-base';

import { withTranslation } from 'react-i18next';

import UserDetailModal from './UserDetailModal';

import imageLogo from '../../assets/images/logo.png';

import Color from '../../theme/Colors';
import { userUrl } from '../../utils/global';

class SignupScreen extends Component {
	state = {
		email: '',
		password: '',
		confirm_password: '',
		userType: 'key0',
		errorText: '',
		isChecking: false,
	};

	_validateNext = () => {
		const { email, password, confirm_password, userType } = this.state;
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
		} else if (confirm_password.trim().length === 0) {
			this.setState({ errorText: t('errors:enter_confirm_password') });
		} else if (password.trim() !== confirm_password.trim()) {
			this.setState({ errorText: t('errors:password_do_not_match') });
		} else {
			this.setState({ isChecking: true, errorText: '' }, () => this._tryToCheckEmail());
		}
	};

	async _tryToCheckEmail() {
		const { email, userType, password } = this.state;
		const { t } = this.props;

		const data = {
			email,
			userType,
		};

		const config = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		};

		const path = userUrl + '/checkEmail';

		try {
			const res = await fetch(path, config);

			if (res.status == 409) {
				const errorText = t('signup:already_mail_exists');
				this.setState({ isChecking: false, errorText });
			} else if (res.status == 200) {
				const param = { email, password, userType };
				this.setState({ isChecking: false, errorText: '' }, () => this.userDetailRef.open(param));
			} else {
				const errorText = t('errors:500_error');
				this.setState({ isChecking: false, errorText });
			}
		} catch (error) {
			const errorText = t('errors:no_internet');
			this.setState({ isChecking: false, errorText });
		}
	}

	_goBack = () => this.props.navigation.navigate('SignIn');

	onUserTypeChange = userType => this.setState({ userType });

	onEmailChange = email => this.setState({ email });

	onPasswordChange = password => this.setState({ password });

	onConfirmPasswordChange = confirm_password => this.setState({ confirm_password });

	_setRef = ref => (this.userDetailRef = ref);

	render() {
		const { userType, email, password, confirm_password, isChecking, errorText } = this.state;
		const { t } = this.props;

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

						<Item>
							<Input
								value={confirm_password}
								placeholder={t('common:confirm_password')}
								secureTextEntry
								onChangeText={this.onConfirmPasswordChange}
							/>
						</Item>
					</Form>

					{errorText.trim().length > 0 ? (
						<Text style={styles.errorText}>{errorText}</Text>
					) : (
						<Text style={styles.errorText} />
					)}

					<Button block style={styles.nextBtn} onPress={this._validateNext} disabled={isChecking}>
						{isChecking ? <ActivityIndicator color='#fff' /> : <Text>{t('signup:next')}</Text>}
					</Button>

					<Text style={styles.bottomText}>
						<Text>{t('signup:already_have_account')} </Text>
						<Text style={styles.goBackBtn} onPress={this._goBack}>
							{t('signup:sign_in_now')}
						</Text>
					</Text>
				</Content>

				<UserDetailModal ref={this._setRef} {...this.props} />
			</ScrollView>
		);
	}
}

const Signup = withTranslation(['signup, errors', 'common', 'userdetailmodal'])(SignupScreen);

export { Signup };

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	logo: {
		flex: 1,
		width: 200,
		height: 250,
		resizeMode: 'contain',
		alignSelf: 'center',
	},
	nextBtn: {
		margin: 15,
		backgroundColor: Color.mainColor,
	},
	bottomText: {
		textAlign: 'center',
	},
	goBackBtn: {
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
