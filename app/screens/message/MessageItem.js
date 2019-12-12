import React, { PureComponent } from "react";
import { StyleSheet } from "react-native";
import io from "socket.io-client";
import ImageLoad from "react-native-image-placeholder";

import { Left, Body, Right, ListItem, Text } from "native-base";
import { TimeAgo } from "../../components";

import LoggedUserCredentials from "../../models/LoggedUserCredentials";
import { baseUrl, userUrl, chatUrl } from "../../utils/global";

export default class MessageItem extends PureComponent {
    lastMessage;

    constructor(props) {
        super(props);
        this.lastMessage = props.room.lastMessage;

        this.state = {
            message: this.lastMessage.message,
            saw_message: this.lastMessage
                ? this.lastMessage.seenBy.includes(
                      LoggedUserCredentials.getUserId()
                  )
                : false
        };

        this.chat_socket = io(baseUrl + "/all_chats");
    }

    componentDidMount() {
        this.chat_socket.on("chat::created", this._onChatMessageReceived);
    }

    componentWillUnmount() {
        this.chat_socket.off("chat::created", this._onChatMessageReceived);
    }

    _onChatMessageReceived = data => {
        const { room } = this.props;

        if (
            data.meta.room_id === room._id &&
            data.meta.toReceiverIds.includes(LoggedUserCredentials.getUserId())
        ) {
            this.setState({ message: data.text, saw_message: false });
        }
    };

    gotoChatScreen = () => {
        this.setState({ saw_message: true });

        const { room, gotoChatScreen } = this.props;
        this.notifyChatMessage();

        let toReceivers = room.participants;

        let data = {
            user: toReceivers,
            roomId: room._id,
            refreshNotiBadge: this.refreshNotiBadge,
            chatType: room.roomType,
            title: room.roomName
        };

        if (room.roomType === "SINGLE") {
            toReceivers = toReceivers.filter(
                user => user._id !== LoggedUserCredentials.getUserId()
            );

            data["title"] = toReceivers[0].name;
        }

        gotoChatScreen(data);
    };

    refreshNotiBadge = () => {
        this.setState({ saw_message: true });
    };

    notifyChatMessage() {
        const { saw_message } = this.state;

        if (!saw_message) {
            const data = {
                userId: LoggedUserCredentials.getUserId(),
                msgId: this.lastMessage._id
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
                .catch(err => console.log(err));
        }
    }

    renderMessage() {
        const { message, saw_message } = this.state;
        const { media, loc } = this.props.room.lastMessage;

        let msg = message;

        if (media) {
            msg = media.contentType.startsWith("image/")
                ? "[ Image ]"
                : "[ Audio ]";
        }

        if (loc) {
            msg = "[ Location ]";
        }

        return (
            <Text numberOfLines={1} note={saw_message}>
                {msg}
            </Text>
        );
    }

    render() {
        const { room } = this.props;

        let fromSender = room.participants;

        if (room.roomType === "SINGLE") {
            fromSender = fromSender.filter(
                user => user._id !== LoggedUserCredentials.getUserId()
            );
        }

        if (fromSender[0]) {
            const fromSenderId =
                room.roomType === "GROUP" ? "123456" : fromSender[0]._id;
            const fromSenderName =
                room.roomType === "GROUP" ? room.roomName : fromSender[0].name;

            const propic_url = userUrl + "/" + fromSenderId + "/profile_pic";

            return (
                <ListItem
                    button
                    thumbnail
                    onPress={this.gotoChatScreen}
                    style={{ width: "100%", marginTop: 3 }}
                >
                    <Left>
                        <ImageLoad
                            style={styles.propic}
                            source={{ uri: propic_url }}
                            placeholderSource={require("../../assets/images/logo.png")}
                            isShowActivity={true}
                        />
                    </Left>
                    <Body>
                        <Text>{fromSenderName}</Text>
                        {this.renderMessage()}
                    </Body>
                    <Right>
                        <Text note>
                            <TimeAgo time={this.lastMessage.createdAt} />
                        </Text>
                    </Right>
                </ListItem>
            );
        }

        return null;
    }
}

const styles = StyleSheet.create({
    propic: {
        width: 70,
        height: 70,
        alignSelf: "center",
        justifyContent: "center"
    }
});
