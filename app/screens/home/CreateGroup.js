import React, { Component } from "react";
import { StyleSheet, View, Platform, Text } from "react-native";

import {
    Container,
    Content,
    Button,
    Icon,
    Header,
    Left,
    Body,
    Right,
    Title,
    Form,
    Input,
    Item
} from "native-base";

import { withTranslation } from "react-i18next";

import Color from "../../theme/Colors";

import { chatRoomUrl } from "../../utils/global";
import LoggedUserCredentials from "../../models/LoggedUserCredentials";

class CreateGroupScreen extends Component {
    state = {
        groupName: "",
        isSaving: false
    };

    close = () => {
        this.props.navigation.goBack();
    };

    _validate = () => {
        const { groupName } = this.state;
        const { t } = this.props;

        if (groupName.trim().length === 0) {
            alert(t("creategroup:can_not_save"));
        } else {
            this.setState({ isSaving: true }, this.onSave);
        }
    };

    onSave = async () => {
        const { groupName } = this.state;
        const roomName = groupName.trim();

        const { t } = this.props;

        const config = {
            headers: {
                Authorization:
                    "Bearer " + LoggedUserCredentials.getAccessToken(),
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                roomName,
                user: LoggedUserCredentials.getUserId(),
                lat: LoggedUserCredentials.getLocation().latitude,
                lng: LoggedUserCredentials.getLocation().longitude
            })
        };

        try {
            const res = await fetch(chatRoomUrl, config);

            if (res.status === 201) {
                this.setState(
                    {
                        isSaving: false,
                        groupName: ""
                    },
                    () => this.props.navigation.goBack()
                );
            } else if (res.status === 409) {
                this.setState({ isSaving: false, groupName: "" }, () =>
                    alert(t("creategroup:already_exist"))
                );
            } else {
                this.setState({ isSaving: false }, () =>
                    alert(t("errors:try_later"))
                );
            }
        } catch (error) {
            this.setState({ isSaving: false }, () =>
                alert(t("errors:no_internet"))
            );
        }
    };

    _onGroupNameChange = groupName => this.setState({ groupName });

    render() {
        const { t } = this.props;

        const { groupName, isSaving } = this.state;

        return (
            <Container>
                <Header style={{ backgroundColor: Color.mainColor }}>
                    <Left>
                        <Button transparent onPress={this.close}>
                            <Icon name="arrow-back" style={styles.whiteColor} />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={styles.whiteColor}>
                            {t("creategroup:create_group")}
                        </Title>
                    </Body>
                    <Right />
                </Header>

                <Content contentContainerStyle={{ flexGrow: 1 }}>
                    {isSaving ? (
                        <View style={styles.centerContent}>
                            <Text style={{ fontSize: 15, fontWeight: "500" }}>
                                {t("common:saving")}
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Form
                                style={{
                                    width: "90%",
                                    alignSelf: "center",
                                    marginTop: 15
                                }}
                            >
                                <Item>
                                    <Input
                                        placeholder={t(
                                            "creategroup:enter_group_name"
                                        )}
                                        value={groupName}
                                        onChangeText={this._onGroupNameChange}
                                    />
                                </Item>
                            </Form>

                            <Text style={styles.h3}>
                                {t("creategroup:info")}
                            </Text>

                            <Button
                                transparent
                                onPress={this._validate}
                                disabled={isSaving}
                                style={styles.saveBtn}
                            >
                                <Text style={styles.whiteColor}>
                                    {t("common:create")}
                                </Text>
                            </Button>
                        </>
                    )}
                </Content>
            </Container>
        );
    }
}

const CreateGroup = withTranslation(["creategroup", "errors", "common"])(
    CreateGroupScreen
);

export { CreateGroup };

const styles = StyleSheet.create({
    saveBtn: {
        backgroundColor: Color.mainColor,
        marginHorizontal: 10,
        marginVertical: 13,
        justifyContent: "center"
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: "contain",
        alignSelf: "center",
        marginTop: 20
    },
    h3: {
        marginVertical: 30,
        textAlign: "center",
        fontSize: 18
    },
    smallIcon: {
        fontSize: 18
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
