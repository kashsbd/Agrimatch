import React, { Component } from "react";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";

import {
    Container,
    Header,
    Left,
    Button,
    Icon,
    Body,
    Title,
    Right
} from "native-base";

import { GiftedChat, Bubble } from "react-native-gifted-chat";
import io from "socket.io-client/dist/socket.io";

import CustomActions from "./CustomActions";
import CustomView from "./CustomView";

import Color from "../../theme/Colors";
import LoggedUserCredentials from "../../models/LoggedUserCredentials";
import { baseUrl, chatUrl, userUrl, chatRoomUrl } from "../../utils/global";

export class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            loading: false,
            loadingEarlier: false,
            hasEarlierMessage: true,
            page: 1
        };

        this.chat_socket = io(baseUrl + "/all_chats");
    }

    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        this.chat_socket.on("chat::created", this._onChatMessageReceived);
        this.setState({ loading: true }, () => this.getMessages());
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getMessages() {
        const {
            selectedGroup: { chatType, user, roomId }
        } = this.props.navigation.state.params.data;

        const { page } = this.state;

        const users = Array.isArray(user) ? user : [user];

        const receiverIds = users.map(usr => usr._id);

        const dataQueryString =
            "?page=" +
            page +
            "&roomId=" +
            roomId +
            "&fromSenderId=" +
            LoggedUserCredentials.getUserId() +
            "&toReceiverIds=" +
            JSON.stringify(receiverIds) +
            "&roomType=" +
            chatType;

        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Bearer " + LoggedUserCredentials.getAccessToken()
            },
            method: "GET"
        };

        const url = chatUrl + "/messages/" + dataQueryString;

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => {
                this.setState({
                    loading: false,
                    error: false,
                    messages: resJson
                });
            })
            .catch(err => this.setState({ loading: false, error: true }));
    }

    _onLoadEarlier = async () => {
        const { page } = this.state;

        const nextPage = page + 1;

        this.setState(
            { page: nextPage, loadingEarlier: true },
            this.getEarlierMessage
        );
    };

    getEarlierMessage = async () => {
        const { page } = this.state;

        const {
            selectedGroup: { chatType, user, roomId }
        } = this.props.navigation.state.params.data;

        const users = Array.isArray(user) ? user : [user];

        const receiverIds = users.map(usr => usr._id);

        const dataQueryString =
            "?page=" +
            page +
            "&roomId=" +
            roomId +
            "&fromSenderId=" +
            LoggedUserCredentials.getUserId() +
            "&toReceiverIds=" +
            JSON.stringify(receiverIds) +
            "&roomType=" +
            chatType;

        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Bearer " + LoggedUserCredentials.getAccessToken()
            },
            method: "GET"
        };

        const url = chatUrl + "/messages/" + dataQueryString;

        try {
            let res = await fetch(url, config);

            if (res.status === 200) {
                const earlier_msgs = await res.json();

                if (earlier_msgs.length > 0 && this._isMounted === true) {
                    this.setState(preState => {
                        return {
                            messages: GiftedChat.prepend(
                                preState.messages,
                                earlier_msgs,
                                Platform.OS !== "web"
                            ),
                            loadingEarlier: false,
                            hasEarlierMessage: true
                        };
                    });
                }
            }
        } catch (error) {
            console.log(error);
            this.setState({ loadingEarlier: false });
        }

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => {
                this.setState({
                    error: false,
                    messages: resJson,
                    loadingEarlier: false
                });
            })
            .catch(err =>
                this.setState({ error: true, loadingEarlier: false })
            );
    };

    componentWillUnmount() {
        this.chat_socket.off("chat::created", this._onChatMessageReceived);
    }

    close = () => this.props.navigation.goBack();

    _onChatMessageReceived = message => {
        const {
            selectedGroup: { roomId }
        } = this.props.navigation.state.params.data;

        if (roomId) {
            if (
                message.meta.room_id === roomId &&
                message.meta.toReceiverIds.includes(
                    LoggedUserCredentials.getUserId()
                )
            ) {
                this.setState(
                    previousState => ({
                        messages: GiftedChat.append(previousState.messages, [
                            message
                        ])
                    }),
                    () => this._notifySeenMsg(message._id)
                );
            }
        } else {
            if (
                message.user._id === LoggedUserCredentials.getUserId() &&
                message.meta.toReceiverIds.includes(
                    LoggedUserCredentials.getUserId()
                )
            ) {
                this.setState(
                    previousState => ({
                        messages: GiftedChat.append(previousState.messages, [
                            message
                        ])
                    }),
                    () => this._notifySeenMsg(message._id)
                );
            }
        }
    };

    _notifySeenMsg(msgId) {
        const data = {
            userId: LoggedUserCredentials.getUserId(),
            msgId
        };

        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Bearer " + LoggedUserCredentials.getAccessToken()
            },
            method: "POST",
            body: JSON.stringify(data)
        };

        const url = chatUrl + "/notifyChatMessage";

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert(err));
    }

    _onSendFromUser = (msgs = []) => {
        const createdAt = new Date();

        const msg = msgs[0];

        if (msg) {
            const msgToUpload = {
                ...msg,
                user: {
                    _id: LoggedUserCredentials.getUserId(),
                    name: LoggedUserCredentials.getUserName()
                },
                createdAt,
                _id: Math.round(Math.random() * 1000000)
            };

            this.setState(
                previousState => ({
                    messages: GiftedChat.append(
                        previousState.messages,
                        [msgToUpload],
                        Platform.OS !== "web"
                    )
                }),
                () => this._sendMessage(msgToUpload)
            );
        }
    };

    _onSend = (msgs = []) => {
        this.setState(
            previousState => ({
                messages: GiftedChat.append(
                    previousState.messages,
                    msgs,
                    Platform.OS !== "web"
                )
            }),
            () => this._sendMessage(msgs[0])
        );
    };

    _sendMessage({ text, image, location }) {
        const {
            selectedGroup: { chatType, user, roomId }
        } = this.props.navigation.state.params.data;

        const users = Array.isArray(user) ? user : [user];

        const receiverIds = users.map(usr => {
            if (usr._id !== LoggedUserCredentials.getUserId()) {
                return usr._id;
            }
        });

        const data = new FormData();
        data.append("fromSenderId", LoggedUserCredentials.getUserId());
        data.append("toReceiverIds", JSON.stringify(receiverIds));
        data.append("roomType", chatType);

        if (roomId) {
            data.append("roomId", roomId);
        }

        if (text && text.trim().length > 0) {
            data.append("text", text);
        }

        if (location) {
            data.append("locationData", JSON.stringify(location));
        }

        if (image) {
            const filename = image.split("/").pop();

            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            data.append("media", {
                uri: image,
                type,
                name: filename
            });
        }

        const config = {
            headers: {
                Authorization:
                    "Bearer " + LoggedUserCredentials.getAccessToken(),
                "Content-Type": "multipart/form-data"
            },
            method: "POST",
            body: data
        };

        fetch(chatUrl, config)
            .then(res => res.json())
            .catch(err => console.log(err));
    }

    _renderCustomActions = props => (
        <CustomActions {...props} onSend={this._onSendFromUser} />
    );

    _renderBubble = props => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: {
                        backgroundColor: "#f0f0f0"
                    }
                }}
            />
        );
    };

    _renderLoadingView = () => {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={Color.mainColor} />
            </View>
        );
    };

    _renderCustomView(props) {
        return <CustomView {...props} />;
    }

    _parsePatterns = linkStyle => {
        return [
            {
                pattern: /#(\w+)/,
                style: { textDecorationLine: "underline", color: "darkorange" }
            }
        ];
    };

    render() {
        const {
            selectedGroup: { title }
        } = this.props.navigation.state.params.data;
        const {
            messages,
            loading,
            loadingEarlier,
            hasEarlierMessage
        } = this.state;

        const currentUser = {
            _id: LoggedUserCredentials.getUserId(),
            name: LoggedUserCredentials.getUserName()
        };

        return (
            <Container>
                <Header style={styles.header}>
                    <Left>
                        <Button transparent onPress={this.close}>
                            <Icon name="arrow-back" style={styles.whiteColor} />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={styles.whiteColor}>{title}</Title>
                    </Body>
                    <Right />
                </Header>

                <GiftedChat
                    messages={messages}
                    onSend={this._onSend}
                    loadEarlier
                    onLoadEarlier={this._onLoadEarlier}
                    isLoadingEarlier={loadingEarlier}
                    parsePatterns={this._parsePatterns}
                    user={currentUser}
                    showUserAvatar
                    showAvatarForEveryMessage
                    scrollToBottom
                    keyboardShouldPersistTaps="never"
                    renderActions={this._renderCustomActions}
                    renderBubble={this._renderBubble}
                    renderCustomView={this._renderCustomView}
                    inverted={Platform.OS !== "web"}
                />
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: Color.mainColor
    },
    mapView: {
        width: 150,
        height: 100,
        borderRadius: 13,
        margin: 3
    },
    chatContainer: {
        flex: 1
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    whiteColor: {
        color: "white"
    }
});
