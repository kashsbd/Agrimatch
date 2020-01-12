import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import { Icon, Text, ListItem, Left, Body, Right } from 'native-base';
import ImageLoad from "react-native-image-placeholder";
import { withTranslation } from "react-i18next";

import Color from '../../theme/Colors';
import { TimeAgo } from '../../components';
import { userUrl, ratingUrl } from '../../utils/global';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';

class NotiListScreen extends React.Component {

    renderEmptyView = () => {
        return (
            <View style={styles.centerContent}>
                <Icon name='notifications-outline' color='black' style={{ fontSize: 40 }} />
                <Text>No Notifications !</Text>
            </View>
        );
    };

    _keyExtractor = (noti, index) => noti._id + index;

    _onAllow = (noti) => async () => {
        const path = ratingUrl + "/action";

        const data = {
            status: 'ALLOW',
            notiId: noti._id,
            ratingId: noti.data._id
        }

        const config = {
            headers: {
                Authorization: "Bearer " + LoggedUserCredentials.getAccessToken(),
                "Content-Type": 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data)
        };

        try {
            const res = await fetch(path, config);

            if (res.status == 200) {
                this.props._onRefresh();
            } else if (res.status == 500) {
                this.props._onRefresh();
            }
        } catch (error) {
            this.props._onRefresh();
        }
    }

    _onCancel = (noti) => async () => {
        const path = ratingUrl + "/action";

        const data = {
            status: 'CANCEL',
            notiId: noti._id,
            ratingId: noti.data._id
        }

        const config = {
            headers: {
                Authorization: "Bearer " + LoggedUserCredentials.getAccessToken(),
                "Content-Type": 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data)
        };

        try {
            const res = await fetch(path, config);

            if (res.status == 200) {
                this.props._onRefresh();
            } else if (res.status == 500) {
                this.props._onRefresh();
            }
        } catch (error) {
            this.props._onRefresh();
        }
    }

    _renderItem = ({ item }) => {
        const { t } = this.props;

        return (
            <ListItem
                button
                thumbnail
                onPress={this.gotoChatScreen}
                style={{ width: "100%", }}
            >
                <Left>
                    <ImageLoad
                        style={styles.propic}
                        source={{ uri: userUrl + "/" + item.createdBy._id + "/profile_pic" }}
                        placeholderSource={require("../../assets/images/logo.png")}
                        isShowActivity={true}
                    />
                </Left>
                <Body>
                    <Text>{item.createdBy.name} <Text>{t("notification:submitted_feedback")}</Text></Text>
                    <View style={{ flexDirection: 'row', marginTop: 5, width: '100%' }}>
                        <View style={{ width: '58%', flexDirection: 'row' }}>
                            <TouchableOpacity onPress={this._onAllow(item)}>
                                <Text>{t("notification:accept")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this._onCancel(item)}>
                                <Text>{t("notification:reject")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text note style={{ paddingTop: 5 }}>
                        <TimeAgo time={item.createdAt} />
                    </Text>
                </Body>
                <Right />
            </ListItem>
        );
    };

    render() {
        const { data, refreshing, _onRefresh } = this.props;

        return (
            <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps='handled'
                keyboardDismissMode='on-drag'
                ListEmptyComponent={this.renderEmptyView}
                data={data}
                renderItem={this._renderItem}
                keyExtractor={this._keyExtractor}
                style={styles.container}
                refreshing={refreshing}
                onRefresh={_onRefresh}
            />
        );
    }
}


const NotiList = withTranslation(["notification"])(NotiListScreen);

export default NotiList;

const styles = StyleSheet.create({
    header: {
        backgroundColor: Color.mainColor,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        padding: 8,
    },
    whiteColor: {
        color: 'white',
    },
    propic: {
        width: 70,
        height: 70,
        alignSelf: "center",
        justifyContent: "center"
    }
});
