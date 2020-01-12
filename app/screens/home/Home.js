import React, { Component } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    AsyncStorage,
    ActivityIndicator,
    Platform,
    AppState
} from "react-native";

import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

import { Container, Icon, Text } from "native-base";

import io from "socket.io-client/dist/socket.io";
import SegmentedControlTab from "react-native-segmented-control-tab";

import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import { withTranslation } from "react-i18next";

import Color from "../../theme/Colors";
import LoggedUserCredentials from "../../models/LoggedUserCredentials";
import { userUrl, baseUrl } from "../../utils/global";

class HomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: LoggedUserCredentials.getUserType() === "FARMER" ? 0 : 1,
            isLoading: false,
            isError: false,
            numberOfUser: 0,
            wholeScreenLoading: true,
            location: null,
            hasChatNoti: false,
            hasNoti: false,
            appState: AppState.currentState
        };

        this.chat_socket = io(
            baseUrl + "/all_chats?userId=" + LoggedUserCredentials.getUserId()
        );

        this.noti_socket = io(
            baseUrl + "/all_notis?userId=" + LoggedUserCredentials.getUserId()
        );
    }

    componentDidMount() {
        this.setState(
            {
                wholeScreenLoading: true,
                hasChatNoti: LoggedUserCredentials.getChatNoti()
            },
            this._getLocationAsync
        );

        this.getChatNotiData();
        this.getNotiData();
        this.subscribeToChannels();
    }

    async getChatNotiData() {
        const path =
            userUrl + "/" + LoggedUserCredentials.getUserId() + "/chatrooms";

        const config = {
            headers: {
                Authorization: "Bearer " + LoggedUserCredentials.getAccessToken()
            },
            method: "GET"
        };

        try {
            const res = await fetch(path, config);

            if (res.status == 200) {
                const chat_msgs = await res.json();

                const seenBys = chat_msgs.map(msg => msg.lastMessage.seenBy);

                const unseenNotis = seenBys.filter(
                    seenBy => !seenBy.includes(LoggedUserCredentials.getUserId())
                );

                if (unseenNotis.length > 0) {
                    this.setState({ hasChatNoti: true }, () =>
                        LoggedUserCredentials.setChatNoti(true)
                    );
                }
            }
        } catch (error) {
            this.setState({ loading: false, isError: true, refreshing: true });
        }
    }

    async getNotiData() {
        const path = userUrl + '/' + LoggedUserCredentials.getUserId() + '/notis';

        const config = {
            headers: {
                Authorization: "Bearer " + LoggedUserCredentials.getAccessToken()
            },
            method: "GET"
        };

        try {
            const res = await fetch(path, config);

            if (res.status === 200) {
                const notis = await res.json();

                if (notis.length > 0) {
                    this.setState({ hasNoti: true }, () =>
                        LoggedUserCredentials.setNoti(true)
                    );
                }
            }
        } catch (error) {
            this.setState({ hasNoti: false });
        }
    }

    subscribeToChannels() {
        this.chat_socket.on("chat::created", this._onChatMessageReceived);
        this.noti_socket.on("noti::created", this._onNotiReceived);
    }

    _onChatMessageReceived = data => {
        if (data.meta.toReceiverId === LoggedUserCredentials.getUserId()) {
            this.setState({ hasChatNoti: true }, () =>
                LoggedUserCredentials.setChatNoti(true)
            );
        }
    };

    _onNotiReceived = data => {
        if (data.createdTo === LoggedUserCredentials.getUserId()) {
            this.setState({ hasNoti: true }, () =>
                LoggedUserCredentials.setNoti(true)
            );
        }
    };

    _getLocationAsync = async () => {
        const loc = LoggedUserCredentials.getLocation();

        if (loc) {
            this.setState(
                { location: loc, wholeScreenLoading: false, isLoading: true },
                () => this.getData()
            );
        } else {
            const { status } = await Permissions.askAsync(Permissions.LOCATION);

            if (status !== "granted") {
                this.setState({
                    errorMessage: "Permission to access location was denied"
                });
            }

            const { coords } = await Location.getCurrentPositionAsync({
                enableHighAccuracy: true
            });

            LoggedUserCredentials.setLocation(coords);

            this.setState(
                { location: coords, wholeScreenLoading: false, isLoading: true },
                () => this.getData()
            );
        }
    };

    async getData() {
        const path =
            userUrl + "/getUserCount?userType=" + LoggedUserCredentials.getUserType();

        const config = {
            headers: {
                Authorization: "Bearer " + LoggedUserCredentials.getAccessToken()
            },
            method: "GET"
        };

        try {
            const res = await fetch(path, config);

            if (res.status == 200) {
                const resJson = await res.json();
                this.setState({
                    isLoading: false,
                    isError: false,
                    numberOfUser: resJson.user_count
                });
            } else if (res.status == 500) {
                this.setState({ isLoading: false, isError: true });
            }
        } catch (error) {
            this.setState({ isLoading: false, isError: true });
        }
    }

    _handleLogOut = async () => {
        const keys = ["accessToken", "userId", "userName", "userType", "lng"];

        try {
            await AsyncStorage.multiRemove(keys);
            this.props.navigation.navigate("Auth");
        } catch (e) {
            console.log("cannot store data");
        }
    };

    _handleRetry = () => {
        this.setState({ isLoading: true }, () => this.getData());
    };

    _setRef = ref => (this.sellInfoRef = ref);

    _gotoTradingInfoList = () =>
        this.props.navigation.navigate("TradingInfoList", {
            showAddButton: true
        });

    _openNearMe = () => this.props.navigation.navigate("NearMe");

    openMessage = () => {
        this.setState({ hasChatNoti: false }, () => {
            LoggedUserCredentials.setChatNoti(false);
            this.props.navigation.navigate("Message");
        }
        );
    };

    openNotification = () => {
        this.setState({ hasNoti: false }, () => {
            LoggedUserCredentials.setNoti(false);
            this.props.navigation.navigate("Notification");
        }
        );
    };

    render() {
        const {
            numberOfUser,
            isLoading,
            isError,
            wholeScreenLoading,
            location,
            hasChatNoti,
            hasNoti
        } = this.state;
        const { t } = this.props;

        if (wholeScreenLoading) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator color={Color.mainColor} size="large" />
                </View>
            );
        }

        return (
            <Container>
                <ScrollView contentContainerStyle={{ flex: 1 }} >
                    <View style={styles.segmentContainer}>
                        <SegmentedControlTab
                            tabsContainerStyle={segStyle.tabsContainerStyle}
                            tabStyle={segStyle.tabStyle}
                            firstTabStyle={segStyle.firstTabStyle}
                            lastTabStyle={segStyle.lastTabStyle}
                            tabTextStyle={segStyle.tabTextStyle}
                            activeTabStyle={segStyle.activeTabStyle}
                            activeTabTextStyle={segStyle.activeTabTextStyle}
                            values={[t("common:farmer_label"), t("common:middleman_label")]}
                            selectedIndex={this.state.selectedIndex}
                            onTabPress={this._handleLogOut}
                        />
                    </View>

                    <MapView
                        style={{ height: "100%" }}
                        provider={PROVIDER_GOOGLE}
                        showsUserLocation
                        initialRegion={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.015,
                            longitudeDelta: 0.015
                        }}
                    />

                    <TouchableOpacity
                        style={[styles.btnBubbleContainer, { position: 'absolute', zIndex: 999, right: '0%', top: '0%' }]}
                        onPress={this.openNotification}
                    >
                        <View style={{ alignItems: "center", position: 'absolute', top: '12%', right: '20%' }}>
                            <View style={[styles.iconWrapper, { width: 40, height: 40, borderRadius: 20 }]}>
                                <Icon
                                    name="notifications-outline"
                                    size={10}
                                    style={styles.iconStyle}
                                />
                            </View>
                        </View>
                        {hasNoti ? <View style={[styles.badge, { top: '8%', right: 20 }]} /> : <View />}
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameStyle}>{`${t(
                                "home:greeting"
                            )} ${LoggedUserCredentials.getUserName()}`}</Text>
                        </View>

                        {isLoading ? (
                            <View style={styles.centerContent}>
                                <ActivityIndicator color={Color.mainColor} size="large" />
                            </View>
                        ) : isError ? (
                            <View style={styles.centerContent}>
                                <TouchableOpacity>
                                    <View style={{ alignItems: "center" }}>
                                        <Icon
                                            name="ios-wifi"
                                            color="black"
                                            style={{ fontSize: 40 }}
                                        />
                                        <Text>{t("home:no_internet")}</Text>
                                        <Text> {t("home:tap_to_retry")} </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ) : (
                                    <>
                                        {LoggedUserCredentials.getUserType() === "FARMER" ? (
                                            <Text style={styles.usingText}>
                                                {t("home:farmers_are_using", { count: numberOfUser })}
                                            </Text>
                                        ) : (
                                                <Text style={styles.usingText}>
                                                    {t("home:middlemen_are_using", { count: numberOfUser })}
                                                </Text>
                                            )}

                                        <View style={styles.bubbleMenuContainer}>
                                            <TouchableOpacity
                                                style={styles.btnBubbleContainer}
                                                onPress={this.openMessage}
                                            >
                                                <View style={{ alignItems: "center" }}>
                                                    <View style={styles.iconWrapper}>
                                                        <Icon
                                                            name="ios-chatbubbles"
                                                            size={20}
                                                            style={styles.iconStyle}
                                                        />
                                                    </View>
                                                    <Text style={styles.msgStyle}>{t("home:messages")}</Text>
                                                </View>
                                                {hasChatNoti ? <View style={styles.badge} /> : <View />}
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.btnBubbleContainer}
                                                onPress={this._gotoTradingInfoList}
                                            >
                                                <View style={{ alignItems: "center" }}>
                                                    <View style={styles.iconWrapper}>
                                                        <Icon name="add" size={20} style={styles.iconStyle} />
                                                    </View>
                                                    {LoggedUserCredentials.getUserType() === "FARMER" ? (
                                                        <Text style={styles.msgStyle}>
                                                            {t("home:sell_goods")}
                                                        </Text>
                                                    ) : (
                                                            <Text style={styles.msgStyle}>
                                                                {t("home:buy_goods")}
                                                            </Text>
                                                        )}
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.btnBubbleContainer]}
                                                onPress={this._openNearMe}
                                            >
                                                <View style={{ alignItems: "center" }}>
                                                    <View style={styles.iconWrapper}>
                                                        <Icon
                                                            name="search"
                                                            size={20}
                                                            style={styles.iconStyle}
                                                        />
                                                    </View>
                                                    <Text
                                                        style={{
                                                            color: Color.mainColor,
                                                            textAlign: "center"
                                                        }}
                                                    >
                                                        {t("home:find_people")}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                    </View>
                </ScrollView>
            </Container>
        );
    }
}

const Home = withTranslation(["home, errors", "common"])(HomeScreen);

export { Home };

const segStyle = StyleSheet.create({
    tabsContainerStyle: {
        borderColor: Color.mainColor
    },
    tabStyle: {
        borderRadius: 1
    },
    firstTabStyle: {
        borderColor: Color.mainColor
    },
    lastTabStyle: {
        borderColor: Color.mainColor
    },
    tabTextStyle: {
        color: Color.mainColor
    },
    activeTabStyle: {
        backgroundColor: Color.mainColor
    },
    activeTabTextStyle: {
        color: "#fff"
    }
});

const styles = StyleSheet.create({
    segmentContainer: {
        paddingTop: Platform.OS === "android" ? 15 : 30,
        position: "absolute",
        zIndex: 999,
        width: "60%",
        alignSelf: "center"
    },
    footerContainer: {
        position: "absolute",
        zIndex: 999,
        height: "30%",
        width: "100%",
        backgroundColor: "#fff",
        bottom: -1
    },
    nameContainer: {
        width: "100%",
        height: "25%",
        backgroundColor: Color.mainColor,
        alignItems: "center",
        justifyContent: "center"
    },
    nameStyle: {
        color: "#fff",
        fontSize: 17
    },
    bubbleMenuContainer: {
        paddingTop: 8,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-around"
    },
    nearMeMenuContainer: {
        paddingVertical: 15,
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 40
    },
    nearMeText: {
        fontSize: 16,
        color: Color.mainColor
    },
    btnBubbleContainer: {
        width: 100,
        height: 80,
        justifyContent: "center",
        alignItems: "center"
    },
    iconWrapper: {
        width: 50,
        height: 50,
        backgroundColor: Color.mainColor,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center"
    },
    msgStyle: {
        textAlign: "left",
        color: Color.mainColor
    },
    iconStyle: {
        color: "#fff"
    },
    usingText: {
        textAlign: "center",
        color: Color.mainColor,
        paddingTop: 5
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    badge: {
        width: 14,
        height: 14,
        borderRadius: 14 / 2,
        backgroundColor: "red",
        position: "absolute",
        zIndex: 1000,
        top: -5,
        right: 23,
        borderWidth: 2,
        borderColor: "white"
    }
});
