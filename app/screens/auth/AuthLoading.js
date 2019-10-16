import React from 'react';
import { StyleSheet, View, AsyncStorage, ActivityIndicator } from 'react-native';

import LoggedUserCredentials from '../../models/LoggedUserCredentials';

export class AuthLoading extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
		};
	}

	componentDidMount() {
		const { navigate } = this.props.navigation;

		const keys = ['accessToken', 'userId', 'userName', 'userType', 'lng'];

		AsyncStorage.multiGet(keys).then(data => {
			if (data) {
				const accessToken = data[0][1];
				const userId = data[1][1];
				const userName = data[2][1];
				const userType = data[3][1];
				const lng = data[4][1];

				if (accessToken && userId && userName && userType && lng) {
					LoggedUserCredentials.setLoggedUserData(accessToken, userName, userId, userType);
					LoggedUserCredentials.setLanguage(lng);

					this.setState({ loading: false }, () => navigate('Home'));
				} else {
					LoggedUserCredentials.setLanguage('en');
					this.setState({ loading: false }, () => navigate('Auth'));
				}
			} else {
				LoggedUserCredentials.setLanguage('en');
				this.setState({ loading: false }, () => navigate('Auth'));
			}
		});
	}

	render() {
		const { loading } = this.state;

		if (loading) {
			return (
				<View style={styles.centerContent}>
					<ActivityIndicator />
				</View>
			);
		}

		return null;
	}
}

const styles = StyleSheet.create({
	centerContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
