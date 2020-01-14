import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';

import { Container, Left, Body, Right, Button, Icon, Header, Title, Text } from 'native-base';

import NotiList from './notiList';
import Color from '../../theme/Colors';

import { userUrl } from '../../utils/global';
import LoggedUserCredentials from '../../models/LoggedUserCredentials';

export class NotiContainer extends Component {
    state = {
        notis: [],
        loading: false,
        refreshing: false,
        isError: false,
    };

    componentDidMount() {
        this.setState({ loading: true }, this.getAllNotis);
    }

    getAllNotis = async () => {
        const path = userUrl + '/' + LoggedUserCredentials.getUserId() + '/notis?returnType=NOTI_MSG_ONLY';

        const config = {
            headers: {
                Authorization: 'Bearer ' + LoggedUserCredentials.getAccessToken(),
            },
            method: 'GET',
        };

        try {
            const res = await fetch(path, config);

            if (res.status == 200) {
                const resJson = await res.json();

                this.setState({
                    loading: false,
                    refreshing: false,
                    isError: false,
                    notis: resJson,
                });
            } else if (res.status == 500) {
                this.setState({ loading: false, isError: true, refreshing: false });
            }
        } catch (error) {
            this.setState({ loading: false, isError: true, refreshing: false });
        }
    };

    close = () => this.props.navigation.pop();

    _onRefresh = () => {
        this.setState({ refreshing: true }, this.getAllNotis);
    };

    tapToRetryBtnPress = () => {
        this.setState({ loading: true, isError: false });
        setTimeout(this.getAllNotis, 1000);
    };

    render() {
        const { notis, loading, isError, refreshing } = this.state;

        return (
            <Container>
                <Header style={styles.header}>
                    <Left>
                        <Button transparent onPress={this.close}>
                            <Icon name='arrow-back' style={styles.whiteColor} />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={styles.whiteColor}>Notifications</Title>
                    </Body>
                    <Right />
                </Header>

                {loading ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator color={Color.mainColor} size='large' />
                    </View>
                ) : isError ? (
                    <View style={styles.centerContent}>
                        <TouchableOpacity onPress={this.tapToRetryBtnPress}>
                            <View style={{ alignItems: 'center' }}>
                                <Icon name='ios-wifi' color='black' style={{ fontSize: 40 }} />
                                <Text>No Internet To Connect !</Text>
                                <Text> Tap To Retry </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ) :
                        < NotiList data={notis} refreshing={refreshing} _onRefresh={this._onRefresh} {...this.props} />
                }
            </Container>
        );
    }
}

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
});
