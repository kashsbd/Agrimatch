import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import * as screens from '../screens';

const HomeStack = createStackNavigator(
	{
		Home: { screen: screens.Home },
		Chat: { screen: screens.Chat },
		NearMe: { screen: screens.NearMe },
		Message: { screen: screens.MessageContainer },
		TradingInfoList: { screen: screens.TradingInfoList },
		TradingInfo: { screen: screens.TradingInfo },
		Profile: { screen: screens.Profile },
	},
	{
		headerMode: 'none',
	},
);

const AuthStack = createStackNavigator(
	{
		SignIn: { screen: screens.Login },
		SignUp: { screen: screens.Signup },
	},
	{
		headerMode: 'none',
	},
);

const MainApp = createSwitchNavigator(
	{
		AuthLoading: { screen: screens.AuthLoading },
		Auth: { screen: AuthStack },
		Home: { screen: HomeStack },
	},
	{
		initialRouteName: 'AuthLoading',
	},
);

export default createAppContainer(MainApp);
