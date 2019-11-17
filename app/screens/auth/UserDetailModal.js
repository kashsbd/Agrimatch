import React, { Component } from "react";
import {
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
  AsyncStorage,
  TouchableOpacity
} from "react-native";

import { Button, Item, Input, Form, Text, Icon, View } from "native-base";

import ph_checker from "myanmar-phonenumber";
import md5 from "react-native-md5";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";
import * as Location from "expo-location";

import default_propic from "../../assets/images/default_propic.png";
import Color from "../../theme/Colors";
import { signupUrl } from "../../utils/global";
import LoggedUserCredentials from "../../models/LoggedUserCredentials";

export default class UserDetailModal extends Component {
  state = {
    modalVisible: false,
    isFarmer: false,
    email: "",
    gpa_cert_no: "",
    gpa_cert_pic: null,
    name: "",
    param: null,
    isSigningUp: false,
    errorText: "",
    proPic: null,
    location: null
  };

  _getLocationAsync = async () => {
    const { location } = this.state;

    if (location) {
      this.setState({ isLoading: true }, this._validateSignUp);
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
        { location: coords, isLoading: true },
        this._validateSignUp
      );
    }
  };

  _validateSignUp = () => {
    const { email, name } = this.state;
    const { t } = this.props;

    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (email.trim().length === 0) {
      this.setState({ errorText: t("errors:enter_email") });
    } else if (!reg.test(email)) {
      this.setState({ errorText: t("errors:enter_valid_email") });
    } else if (name.trim().length === 0) {
      this.setState({ errorText: t("errors:enter_name") });
    } else {
      this.setState({ isSigningUp: true, errorText: "" }, () =>
        this._tryToSignUp()
      );
    }
  };

  async _tryToSignUp() {
    const {
      isFarmer,
      email,
      gpa_cert_no,
      gpa_cert_pic,
      name,
      param,
      proPic,
      location
    } = this.state;
    const { t } = this.props;

    const data = new FormData();
    data.append("email", email);
    data.append("password", md5.hex_md5(param.password));
    data.append("userType", param.userType);
    data.append("name", name);
    data.append("phno", param.ph_no);
    data.append("lng", location.longitude);
    data.append("lat", location.latitude);

    if (proPic !== null) {
      const localUri = proPic.uri;
      const filename = localUri.split("/").pop();

      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      data.append("proPic", {
        uri: localUri,
        type,
        name: filename
      });
    }

    if (isFarmer === true && gpa_cert_no.trim().length > 0) {
      data.append("gpaCertNo", gpa_cert_no);
    }

    if (isFarmer === true && gpa_cert_pic !== null) {
      const localUri = gpa_cert_pic.uri;
      const filename = localUri.split("/").pop();

      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      data.append("gpaCertPic", {
        uri: localUri,
        type,
        name: filename
      });
    }

    const config = {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      body: data
    };

    try {
      const res = await fetch(signupUrl, config);

      if (res.status === 201) {
        const resJson = await res.json();

        const accessTokenArray = ["accessToken", resJson.token];
        const userIdArray = ["userId", resJson.userId];
        const userNameArray = ["userName", resJson.name];
        const userTypeArray = ["userType", resJson.userType];
        const lngArray = ["lng", LoggedUserCredentials.getLanguage()];

        LoggedUserCredentials.setLoggedUserData(
          resJson.token,
          resJson.name,
          resJson.userId,
          resJson.userType
        );

        await AsyncStorage.multiSet([
          accessTokenArray,
          userIdArray,
          userNameArray,
          userTypeArray,
          lngArray
        ]);

        this.setState({ isSigningUp: false, errorText: "" }, () =>
          this.props.navigation.navigate("Home")
        );
      } else {
        const errorText = t("errors:500_error");
        this.setState({ isSigningUp: false, errorText });
      }
    } catch (error) {
      console.log(error);
      const errorText = t("errors:no_internet");
      this.setState({ isSigningUp: false, errorText });
    }
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      } else {
        this.pickImage();
      }
    } else {
      this.pickImage();
    }
  };

  async pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3]
    });

    if (!result.cancelled) {
      this.setState({ proPic: result });
    }
  }

  open = param => {
    this.setState({
      modalVisible: true,
      isFarmer: param.userType === "FARMER",
      param
    });
  };

  close = () => this.setState({ modalVisible: false });

  onEmailChange = email => this.setState({ email });

  onNameChange = name => this.setState({ name });

  onGpaCertNoChange = gpa_cert_no => this.setState({ gpa_cert_no });

  render() {
    const {
      modalVisible,
      email,
      name,
      isFarmer,
      gpa_cert_no,
      isSigningUp,
      errorText,
      proPic
    } = this.state;
    const { t } = this.props;

    const pro_pic = proPic ? { uri: proPic.uri } : default_propic;

    return (
      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        onRequestClose={this.close}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View>
            <View style={styles.imgContainer}>
              <Image source={pro_pic} style={styles.logo} />
              <TouchableOpacity
                style={styles.uploadIcon}
                onPress={this.getPermissionAsync}
              >
                <Icon name="camera" style={styles.camera} />
              </TouchableOpacity>
            </View>

            <Form style={{ paddingRight: 15 }}>
              <Item>
                <Input
                  value={email}
                  placeholder={t("common:email")}
                  onChangeText={this.onEmailChange}
                  keyboardType="email-address"
                />
              </Item>

              <Item>
                <Input
                  value={name}
                  placeholder={t("userdetailmodal:name")}
                  onChangeText={this.onNameChange}
                />
              </Item>

              {isFarmer && (
                <Item>
                  <Input
                    value={gpa_cert_no}
                    placeholder={t("userdetailmodal:gpa_cert_no")}
                    onChangeText={this.onGpaCertNoChange}
                  />
                  <Icon active name="camera" />
                </Item>
              )}
            </Form>

            {errorText.trim().length > 0 ? (
              <Text style={styles.errorText}>{errorText}</Text>
            ) : (
              <Text style={styles.errorText} />
            )}

            <Button
              block
              style={styles.saveBtn}
              onPress={this._getLocationAsync}
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text>{t("common:save")}</Text>
              )}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  camera: {
    alignSelf: "center",
    color: "#fff"
  },
  uploadIcon: {
    position: "absolute",
    left: 0,
    bottom: 0,
    padding: 4,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    width: "100%"
  },
  imgContainer: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignSelf: "center",
    marginVertical: 35,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "gray"
  },
  logo: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignSelf: "center"
  },
  saveBtn: {
    margin: 15,
    marginTop: 50,
    backgroundColor: Color.mainColor
  },
  errorText: {
    color: "red",
    fontSize: 17,
    textAlign: "right",
    paddingRight: 17,
    textAlignVertical: "center",
    height: 40
  }
});
