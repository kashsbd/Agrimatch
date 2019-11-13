import React, { Component } from "react";
import { StyleSheet, Image, View, TouchableOpacity } from "react-native";

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
  H3,
  Text,
  Item,
  Picker,
  Input
} from "native-base";

import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";
import { withTranslation } from "react-i18next";

import Color from "../../theme/Colors";
import LoggedUserCredentials from "../../models/LoggedUserCredentials";
import { cropUrl } from "../../utils/global";

class TradingInfoScreen extends Component {
  state = {
    cropCategory: "",
    cropType: "Peanuts (groundnuts)",
    quantity: "",
    image: null,
    isSaving: false
  };

  _close = () => this.props.navigation.goBack();

  onSave = async () => {
    const { cropType, quantity, image, cropCategory } = this.state;
    const { t } = this.props;

    if (quantity.trim().length === 0) {
      alert(t("tradinginfo:enter_quantity"));
    } else if (image === null) {
      alert(t("tradinginfo:select_photo"));
    } else {
      let data = new FormData();
      data.append("userId", LoggedUserCredentials.getUserId());
      data.append("cropCategory", cropCategory);
      data.append("cropType", cropType);
      data.append("quantity", quantity);

      const localUri = image.uri;
      const filename = localUri.split("/").pop();

      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      data.append("cropImage", {
        uri: localUri,
        type,
        name: filename
      });

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + LoggedUserCredentials.getAccessToken()
        },
        method: "POST",
        body: data
      };

      this.setState({ isSaving: true });

      try {
        let res = await fetch(cropUrl, config);
        if (res.status == 201) {
          this.setState({ isSaving: false });
          const crop = await res.json();
          this.props.navigation.state.params.updateCropList(crop);
          this.props.navigation.goBack();
        } else if (res.status == 500) {
          this.setState({ isSaving: false }, () =>
            alert(t("errors:try_later"))
          );
        }
      } catch (error) {
        this.setState({ isSaving: false }, () =>
          alert(t("errors:no_internet"))
        );
      }
    }
  };

  onCropTypeChange = cropType => this.setState({ cropType });

  onCropCategoryChange = cropCategory => this.setState({ cropCategory });

  onQuantityChange = quantity => this.setState({ quantity });

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
      this.setState({ image: result });
    }
  }

  removeImage = () => this.setState({ image: null });

  render() {
    const { cropType, quantity, image, isSaving, cropCategory } = this.state;
    const { t } = this.props;

    return (
      <Container>
        <Header style={{ backgroundColor: Color.mainColor }}>
          <Left>
            <Button transparent onPress={this._close}>
              <Icon name="arrow-back" style={styles.whiteColor} />
            </Button>
          </Left>
          <Body>
            {LoggedUserCredentials.getUserType() === "FARMER" ? (
              <Title style={styles.whiteColor}>
                {t("tradinginfo:selling_info")}
              </Title>
            ) : (
              <Title style={styles.whiteColor}>
                {t("tradinginfo:buying_info")}
              </Title>
            )}
          </Body>
          <Right />
        </Header>

        <Content padder contentContainerStyle={{ flexGrow: 1 }}>
          {isSaving ? (
            <View style={styles.centerContent}>
              <Text>{t("common:saving")}</Text>
            </View>
          ) : (
            <>
              {LoggedUserCredentials.getUserType() === "FARMER" ? (
                <H3 style={styles.h3}>{t("tradinginfo:sell_today")} </H3>
              ) : (
                <H3 style={styles.h3}>{t("tradinginfo:buy_today")} </H3>
              )}

              <View style={{ marginTop: 20 }}>
                <Text style={styles.h3}>{t("tradinginfo:type_of_crop")}</Text>
                <Item picker style={{ marginLeft: 40, marginRight: 40 }}>
                  <Picker
                    mode="dropdown"
                    iosIcon={<Icon name="arrow-down" />}
                    style={{ width: undefined }}
                    placeholderStyle={{ color: "#bfc6ea" }}
                    placeholderIconColor="#007aff"
                    selectedValue={cropType}
                    onValueChange={this.onCropTypeChange}
                  >
                    {/* Nuts */}
                    <Picker.Item
                      label={t("croplist:Peanuts (groundnuts)")}
                      value="Peanuts (groundnuts)"
                    />
                    <Picker.Item
                      label={t("croplist:Areca Nut")}
                      value="Areca Nut"
                    />
                    <Picker.Item label={t("croplist:Betel")} value="Betel" />
                    <Picker.Item
                      label={t("croplist:Cashews")}
                      value="Cashews"
                    />
                    <Picker.Item
                      label={t("croplist:Macadamia")}
                      value="Macadamia"
                    />
                    {/* Beans and legumes (pulses) */}
                    <Picker.Item
                      label={t("croplist:Soybeans")}
                      value="Soybeans"
                    />
                    <Picker.Item
                      label={t("croplist:Mung beans")}
                      value="Mung beans"
                    />
                    <Picker.Item
                      label={t("croplist:Adzuki beans")}
                      value="Adzuki beans"
                    />
                    <Picker.Item
                      label={t("croplist:Black beans")}
                      value="Black beans"
                    />
                    <Picker.Item
                      label={t("croplist:Coffee beans")}
                      value="Coffee beans"
                    />
                    <Picker.Item
                      label={t("croplist:Chickpeas")}
                      value="Chickpeas"
                    />
                    <Picker.Item
                      label={t("croplist:Lentils")}
                      value="Lentils"
                    />
                    {/* Cerial grains */}
                    <Picker.Item label={t("croplist:Rice")} value="Rice" />
                    <Picker.Item label={t("croplist:Corn")} value="Corn" />
                    <Picker.Item label={t("croplist:Wheat")} value="Wheat" />
                    <Picker.Item label={t("croplist:Barley")} value="Barley" />
                    {/* Flowers */}
                    <Picker.Item label={t("croplist:Cotton")} value="Cotton" />
                    <Picker.Item label={t("croplist:Roses")} value="Roses" />
                    <Picker.Item label={t("croplist:Lilies")} value="Lilies" />
                    {/* Herbs and vegetables */}
                    <Picker.Item label={t("croplist:Tea")} value="Tea" />
                    <Picker.Item label={t("croplist:Kale")} value="Kale" />
                    <Picker.Item label={t("croplist:Onion")} value="Onion" />
                    <Picker.Item
                      label={t("croplist:Shallot")}
                      value="Shallot"
                    />
                    <Picker.Item label={t("croplist:Carrot")} value="Carrot" />
                    <Picker.Item label={t("croplist:Potato")} value="Potato" />
                    <Picker.Item
                      label={t("croplist:Sweet potato")}
                      value="Sweet potato"
                    />
                    <Picker.Item label={t("croplist:Chili")} value="Chili" />
                    <Picker.Item label={t("croplist:Okra")} value="Okra" />
                  </Picker>
                </Item>
              </View>

              <View style={{ marginTop: 5 }}>
                <Text style={styles.h3}>{t("tradinginfo:quantity")}</Text>
                <View
                  style={{
                    marginLeft: 40,
                    marginRight: 40,
                    marginTop: 10,
                    flexDirection: "row",
                    alignSelf: "center"
                  }}
                >
                  <Item regular style={{ width: "15%" }}>
                    <Input
                      keyboardType="numeric"
                      maxLength={3}
                      value={quantity}
                      style={{ height: 40 }}
                      onChangeText={this.onQuantityChange}
                    />
                  </Item>
                  <Text
                    style={{
                      textAlignVertical: "center",
                      marginLeft: 5
                    }}
                  >
                    {t("tradinginfo:kg")}
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 20 }}>
                <Text style={styles.h3}>{t("tradinginfo:sample_photo")}</Text>
                {image ? (
                  <View>
                    <Image source={{ uri: image.uri }} style={styles.img} />
                    <TouchableOpacity
                      style={styles.delBtn}
                      onPress={this.removeImage}
                    >
                      <Icon name="close" size={5} style={styles.delIcon} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Button
                    transparent
                    style={styles.pickImgBtn}
                    onPress={this.getPermissionAsync}
                  >
                    <Icon name="camera" size={20} style={styles.cameraIcon} />
                  </Button>
                )}
              </View>

              <Button style={styles.saveBtn} onPress={this.onSave}>
                <Text style={styles.whiteColor}>{t("common:save")}</Text>
              </Button>
            </>
          )}
        </Content>
      </Container>
    );
  }
}

const TradingInfo = withTranslation([
  "tradinginfo, errors",
  "common",
  "croplist"
])(TradingInfoScreen);

export { TradingInfo };

const styles = StyleSheet.create({
  saveBtn: {
    backgroundColor: Color.mainColor,
    marginHorizontal: 10,
    marginTop: 20,
    justifyContent: "center"
  },
  h3: {
    textAlign: "center",
    color: Color.mainColor,
    paddingTop: 20
  },
  pickImgBtn: {
    alignSelf: "center",
    marginTop: 10,
    height: 150
  },
  img: {
    width: 160,
    height: 150,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: Color.mainColor,
    marginVertical: 10
  },
  delBtn: {
    position: "absolute",
    zIndex: 2,
    left: 224,
    top: 5,
    backgroundColor: Color.mainColor,
    width: 25,
    height: 25,
    borderRadius: 25 / 2
  },
  delIcon: {
    alignSelf: "center"
  },
  cameraIcon: {
    color: "black"
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
