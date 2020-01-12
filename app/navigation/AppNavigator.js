import React from "react";
import { createSwitchNavigator, createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import { I18nextProvider, withTranslation } from "react-i18next";

import * as screens from "../screens";
import { i18n } from "../i18n";

const NotiStack = createStackNavigator(
    {
        NotiContainer: { screen: screens.NotiContainer }
    },
    {
        headerMode: "none"
    }
)

const HomeStack = createStackNavigator(
    {
        Home: { screen: screens.Home },
        Chat: { screen: screens.Chat },
        NearMe: { screen: screens.NearMe },
        Message: { screen: screens.MessageContainer },
        Notification: { screen: NotiStack },
        TradingInfoList: { screen: screens.TradingInfoList },
        TradingInfo: { screen: screens.TradingInfo },
        CreateGroup: { screen: screens.CreateGroup },
        Profile: { screen: screens.Profile }
    },
    {
        headerMode: "none"
    }
);

const AuthStack = createStackNavigator(
    {
        SignIn: { screen: screens.Login },
        SignUp: { screen: screens.Signup }
    },
    {
        headerMode: "none"
    }
);

const MainApp = createSwitchNavigator(
    {
        AuthLoading: { screen: screens.AuthLoading },
        Auth: { screen: AuthStack },
        Home: { screen: HomeStack }
    },
    {
        initialRouteName: "AuthLoading"
    }
);

const AppContainer = createAppContainer(MainApp);

const WrappedApp = () => {
    return <AppContainer screenProps={{ t: i18n.getFixedT() }} />;
};

const ReloadAppOnLanguageChange = withTranslation("translation", {
    bindI18n: "languageChanged",
    bindStore: false
})(WrappedApp);

export default function () {
    return (
        <I18nextProvider i18n={i18n}>
            <ReloadAppOnLanguageChange />
        </I18nextProvider>
    );
}
