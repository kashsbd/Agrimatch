import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text as RNText,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from "react-native";

import {
  Container,
  Button,
  Icon,
  Header,
  Left,
  Body,
  Right,
  Title,
  Text,
  Item,
  Picker
} from "native-base";

import { AccordionList } from "accordion-collapse-react-native";
import { withTranslation } from "react-i18next";

import Color from "../../theme/Colors";
import LoggedUserCredentials from "../../models/LoggedUserCredentials";
import { cropUrl, baseUrl } from "../../utils/global";

class TradingInfoListScreen extends Component {
  state = {
    loading: false,
    crops: [],
    error: false,
    page: 1,
    totalPages: 1,
    refreshing: false,
    cropType: "All"
  };

  componentDidMount() {
    this.setState({ loading: true }, () => this.getAllCrops());
  }

  async getAllCrops() {
    const { page, crops, cropType } = this.state;

    const { user, showAddButton } = this.props.navigation.state.params;

    const config = {
      headers: {
        Authorization: "Bearer " + LoggedUserCredentials.getAccessToken()
      },
      method: "GET"
    };

    const userId = showAddButton
      ? LoggedUserCredentials.getUserId()
      : user.user._id;

    const url =
      cropUrl + "?page=" + page + "&user=" + userId + "&cropType=" + cropType;

    try {
      const res = await fetch(url, config);

      if (res.status == 200) {
        const resJson = await res.json();
        this.setState({
          crops: page === 1 ? resJson.docs : [...crops, ...resJson.docs],
          totalPages: resJson.pages,
          loading: false,
          error: false,
          refreshing: false
        });
      } else if (res.status == 500) {
        this.setState({
          loading: false,
          error: true,
          refreshing: false
        });
      }
    } catch (error) {
      this.setState({ loading: false, error: true, refreshing: false });
    }
  }

  _handleLoadMore = () => {
    const { page, totalPages } = this.state;

    if (page < totalPages) {
      this.setState({ page: page + 1 }, () => this.getAllCrops());
    }
  };

  _onRefresh = () => {
    this.setState({ refreshing: true, page: 1, totalPages: 1 }, () =>
      this.getAllCrops()
    );
  };

  _renderFooter = () => {
    const { page, totalPages } = this.state;

    if (page === totalPages) return null;

    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator size="large" color={Color.mainColor} />
      </View>
    );
  };

  _updateCropList = crop => {
    if (crop) {
      const uploadedCrop = [crop];
      this.setState(prevState => ({
        crops: [...uploadedCrop, ...prevState.crops]
      }));
    }
  };

  _showTradingInfo = () =>
    this.props.navigation.navigate("TradingInfo", {
      updateCropList: this._updateCropList
    });

  _goBack = () => this.props.navigation.goBack();

  _openNearMe = () => this.props.navigation.navigate("NearMe");

  _goToProfile = () =>
    this.props.navigation.navigate("Profile", {
      user: this.props.navigation.state.params.user
    });

  _renderAccordionHeader = item => {
    const date = new Date(item.createdAt);

    const cropType = this.props.t(`croplist:${item.cropType}`);

    const cropQuantity = this.props.t("tradinginfolist:in_kg", {
      qt: item.quantity
    });

    const headerString = `${date.toLocaleDateString()}  (${cropType}, ${cropQuantity})`;

    return (
      <View
        style={{
          height: 50,
          backgroundColor: "#f2f2f2",
          justifyContent: "center",
          borderWidth: StyleSheet.hairlineWidth
        }}
        key={item._id}
      >
        <Text style={{ paddingLeft: 10 }}>{headerString}</Text>
      </View>
    );
  };

  _renderAccordionBody = item => {
    const { t } = this.props;

    const cropType = t(`croplist:${item.cropType}`);

    return (
      <View style={{ paddingLeft: 20 }} key={item._id}>
        <Item>
          <Text>{t("tradinginfolist:crop_type")} </Text>
          <Text>{cropType}</Text>
        </Item>
        <Item>
          <Text>{t("tradinginfolist:quantity")} </Text>
          <Text>{t("tradinginfolist:in_kg", { qt: item.quantity })}</Text>
        </Item>
        {item.media && (
          <Item style={{ justifyContent: "center", padding: 10 }}>
            <Image
              style={{ width: 120, height: 120 }}
              source={{
                uri:
                  baseUrl +
                  "/crops/media/" +
                  item.media._id +
                  "/" +
                  item.media.name
              }}
            />
          </Item>
        )}
      </View>
    );
  };

  onCropTypeChange = cropType =>
    this.setState({ cropType, loading: true, page: 1, totalPages: 1 }, () =>
      this.getAllCrops()
    );

  _renderListHeader = () => {
    const { cropType } = this.state;
    const { t } = this.props;

    return (
      <View style={styles.listHeaderContainer}>
        <View style={styles.listHeader}>
          <Text>{t("tradinginfolist:filter_crop")}</Text>
          <Item picker style={{ width: "70%" }}>
            <Picker
              mode="dropdown"
              iosIcon={<Icon name="arrow-down" />}
              style={{ width: undefined, marginLeft: 10 }}
              placeholderStyle={{ color: "#bfc6ea" }}
              placeholderIconColor="#007aff"
              selectedValue={cropType}
              onValueChange={this.onCropTypeChange}
            >
              <Picker.Item label={t("croplist:All")} value="All" />
              {/* Nuts */}
              <Picker.Item
                label={t("croplist:Peanuts (groundnuts)")}
                value="Peanuts (groundnuts)"
              />
              <Picker.Item label={t("croplist:Areca Nut")} value="Areca Nut" />
              <Picker.Item label={t("croplist:Betel")} value="Betel" />
              <Picker.Item label={t("croplist:Cashews")} value="Cashews" />
              <Picker.Item label={t("croplist:Macadamia")} value="Macadamia" />
              {/* Beans and legumes (pulses) */}
              <Picker.Item label={t("croplist:Soybeans")} value="Soybeans" />
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
              <Picker.Item label={t("croplist:Chickpeas")} value="Chickpeas" />
              <Picker.Item label={t("croplist:Lentils")} value="Lentils" />
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
              <Picker.Item label={t("croplist:Shallot")} value="Shallot" />
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
      </View>
    );
  };

  _keyExtractor = (crop, index) => crop._id + index;

  _setRef = ref => (this.flatListRef = ref);

  _renderNoCrops = () => {
    const { t } = this.props;

    return (
      <View style={styles.centerContent}>
        <Icon name="ios-paper" color="black" style={{ fontSize: 40 }} />
        <Text style={styles.blackText}>{t("tradinginfolist:no_crops")}</Text>
      </View>
    );
  };

  render() {
    const { crops, error, loading, refreshing } = this.state;
    const { showAddButton, user } = this.props.navigation.state.params;
    const { t } = this.props;

    return (
      <Container>
        <Header style={{ backgroundColor: Color.mainColor }}>
          <Left>
            <Button transparent onPress={this._goBack}>
              <Icon name="arrow-back" style={styles.whiteColor} />
            </Button>
          </Left>
          <Body>
            {LoggedUserCredentials.getUserType() === "FARMER" ? (
              <Title style={styles.whiteColor}>
                {t("tradinginfolist:selling_info_list")}
              </Title>
            ) : (
              <Title style={styles.whiteColor}>
                {t("tradinginfolist:buying_info_list")}
              </Title>
            )}
          </Body>

          {showAddButton ? (
            <Right>
              <Button transparent onPress={this._showTradingInfo}>
                <Icon
                  name="ios-add-circle-outline"
                  style={{ color: "white", fontSize: 32 }}
                />
              </Button>
            </Right>
          ) : (
            <Right>
              {LoggedUserCredentials.getUserType() === user.user.userType ? (
                <Button transparent />
              ) : (
                <Button transparent onPress={this._goToProfile}>
                  <RNText style={styles.transactStyle}>
                    {t("tradinginfolist:transact")}
                  </RNText>
                </Button>
              )}
            </Right>
          )}
        </Header>

        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator color={Color.mainColor} size="large" />
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <TouchableOpacity>
                <View style={{ alignItems: "center" }}>
                  <Icon
                    name="ios-wifi"
                    color="black"
                    style={{ fontSize: 40 }}
                  />
                  <Text>{t("tradinginfolist:no_internet")}</Text>
                  <Text> {t("tradinginfolist:tap_to_retry")} </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <AccordionList
              list={crops}
              contentContainerStyle={{ flexGrow: 1 }}
              header={this._renderAccordionHeader}
              body={this._renderAccordionBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              keyExtractor={this._keyExtractor}
              ListHeaderComponent={this._renderListHeader}
              ListEmptyComponent={this._renderNoCrops}
              refreshing={refreshing}
              onRefresh={this._onRefresh}
              ListFooterComponent={this._renderFooter}
              onEndReached={this._handleLoadMore}
              onEndReachedThreshold={0.5}
            />
          )}
        </View>
      </Container>
    );
  }
}

const TradingInfoList = withTranslation([
  "tradinginfolist, errors",
  "common",
  "croplist"
])(TradingInfoListScreen);

export { TradingInfoList };

const styles = StyleSheet.create({
  transactStyle: {
    color: "white",
    fontSize: 17,
    textAlign: "center"
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  blackText: {
    color: "black"
  },
  whiteColor: {
    color: "white"
  },
  listHeaderContainer: {
    height: 60,
    justifyContent: "center",
    backgroundColor: "#d3d3d3"
  },
  listHeader: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center"
  }
});
