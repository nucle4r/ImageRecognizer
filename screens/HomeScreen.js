import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  LayoutAnimation
} from "react-native";
import {
  Container,
  Content,
  Header,
  Left,
  Title,
  ListItem,
  Right
} from "native-base";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import { Ionicons } from "@expo/vector-icons";
import * as Clarifai from "clarifai";
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded
} from "expo-ads-admob";

export default class HomeScreen extends Component {
  state = {
    image: null,
    imageBase64: "",
    concepts1: [],
    concepts2: [],
    concepts3: [],
    concepts4: [],
    conceptStatus: null,
    uploadStarted: false,
    listLoading: false,
    imageStatus: null,
    actionCall: 0
  };

  componentDidMount() {
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );
      if (status !== "granted") {
        Alert.alert(
          "Sorry, we need camera roll permissions to make this work!"
        );
      }
    }
  };
  bannerError = error => {
    Alert.alert(`${error}`);
  };

  awardAdCaller = async () => {
    if (this.state.actionCall == 3) {
      AdMobRewarded.setAdUnitID("ca-app-pub-7328130788754961/4433152574");// AdMobRewarded.setAdUnitID("ca-app-pub-3940256099942544/5224354917");
      AdMobRewarded.setTestDeviceID("EMULATOR");
      await AdMobRewarded.requestAdAsync();
      await AdMobRewarded.showAdAsync();
      this.setState({ actionCall: 0 });
    }
  };

  getConcepts = async () => {
    this.setState({ listLoading: true, actionCall: this.state.actionCall + 1 });
    const ClarifaiApp = new Clarifai.App({
      apiKey: "217e81f225f54bca844398020d99818c"
    });

    ClarifaiApp.models
      .predict(Clarifai.GENERAL_MODEL, { base64: this.state.imageBase64 })
      .then(async response => {
        this.setState({ imageStatus: "Reading Image" });
        let concepts = response["outputs"][0]["data"]["concepts"];

        this.state.concepts1.push(
          concepts[0],
          concepts[1],
          concepts[2],
          concepts[3],
          concepts[4]
        );
        this.state.concepts2.push(
          concepts[5],
          concepts[6],
          concepts[7],
          concepts[8],
          concepts[9]
        );
        this.state.concepts3.push(
          concepts[10],
          concepts[11],
          concepts[12],
          concepts[13],
          concepts[14]
        );
        this.state.concepts4.push(
          concepts[15],
          concepts[16],
          concepts[17],
          concepts[18],
          concepts[19]
        );

        this.setState({
          conceptStatus: "fetched",
          uploadStarted: false,
          listLoading: false
        });
        this.awardAdCaller();
      })
      .catch(err => {
        Alert.alert("There was something wrong with AI.");
      });
  };

  _pickImage = async () => {
    this.setState({
      image: null,
      imageBase64: "",
      concepts1: [],
      concepts2: [],
      concepts3: [],
      concepts4: [],
      conceptStatus: null,
      listLoading: false,
      imageStatus: null
    });
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.25,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true
    });

    if (!result.cancelled) {
      this.setState({
        uploadStarted: true,
        image: result.uri,
        imageBase64: result.base64,
        imageStatus: "Sending Image to AI"
      });

      this.getConcepts();
    }
  };
  _captureImage = async () => {
    this.setState({
      image: null,
      imageBase64: "",
      concepts1: [],
      concepts2: [],
      concepts3: [],
      concepts4: [],
      conceptStatus: null,
      listLoading: false,
      imageStatus: null
    });
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.25,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true
    });

    if (!result.cancelled) {
      this.setState({
        uploadStarted: true,
        image: result.uri,
        imageBase64: result.base64,
        imageStatus: "Sending Image to AI"
      });

      this.getConcepts();
    }
  };

  render() {
    LayoutAnimation.easeInEaseOut();

    const { image, uploadStarted } = this.state;

    const Loader = (
      <View style={styles.container}>
        <Image
          source={require("../assets/reading-robot.gif")}
          style={{ width: 100, height: 140 }}
        />
      </View>
    );

    const adBanner = (
      <AdMobBanner
        bannerSize="banner"
        adUnitID="ca-app-pub-7328130788754961/3567326299"
        testDeviceID="EMULATOR"
        servePersonalizedAds
        onDidFailToReceiveAdWithError={error => this.bannerError(error)}
      />
    );

    const imageHolder = (
      <View style={styles.imageContainer}>
        <Image
          source={image ? { uri: image } : require("../assets/placeholder.png")}
          style={{ width: 200, height: 200 }}
        />
        {uploadStarted ? <View style={styles.overlay} /> : null}
        {uploadStarted ? (
          <View style={styles.uploadActivity}>
            <ActivityIndicator color="#ffffff" size="large" />
            <Text
              style={{ alignSelf: "center", color: "#fff", fontWeight: "200" }}
            >
              {this.state.imageStatus}
            </Text>
          </View>
        ) : null}
      </View>
    );

    const ConceptsLists = (
      <View>
        {this.state.conceptStatus !== null ? (
          <View>
            <View style={{ marginLeft: 15, marginTop: 30, marginBottom: 15 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                AI Predictions: 20
              </Text>
            </View>
            <View>
              <FlatList
                data={this.state.concepts1}
                renderItem={({ item }) => (
                  <ListItem>
                    <Left>
                      <Text
                        style={{
                          textTransform: "uppercase",
                          color: "#252525",
                          fontSize: 16,
                          fontWeight: "400"
                        }}
                      >
                        {item.name}
                      </Text>
                    </Left>
                    <Right>
                      <View style={styles.percentage1}>
                        <Text style={{ color: "#fff" }}>
                          {`${Math.floor(item.value * 100)}`}%
                        </Text>
                      </View>
                    </Right>
                  </ListItem>
                )}
                keyExtractor={item => item.id}
              />
            </View>
            <View style={styles.listAd}>
              <Text>AD</Text>
              {adBanner}
            </View>
            <View>
              <FlatList
                data={this.state.concepts2}
                renderItem={({ item }) => (
                  <ListItem>
                    <Left>
                      <Text
                        style={{
                          textTransform: "uppercase",
                          color: "#252525",
                          fontSize: 16,
                          fontWeight: "400"
                        }}
                      >
                        {item.name}
                      </Text>
                    </Left>
                    <Right>
                      <View style={styles.percentage2}>
                        <Text style={{ color: "#fff" }}>
                          {`${Math.floor(item.value * 100)}`}%
                        </Text>
                      </View>
                    </Right>
                  </ListItem>
                )}
                keyExtractor={item => item.id}
              />
            </View>
            <View style={styles.listAd}>
              <Text>AD</Text>
              {adBanner}
            </View>
            <View>
              <FlatList
                data={this.state.concepts3}
                renderItem={({ item }) => (
                  <ListItem>
                    <Left>
                      <Text
                        style={{
                          textTransform: "uppercase",
                          color: "#252525",
                          fontSize: 16,
                          fontWeight: "400"
                        }}
                      >
                        {item.name}
                      </Text>
                    </Left>
                    <Right>
                      <View style={styles.percentage3}>
                        <Text style={{ color: "#fff" }}>
                          {`${Math.floor(item.value * 100)}`}%
                        </Text>
                      </View>
                    </Right>
                  </ListItem>
                )}
                keyExtractor={item => item.id}
              />
            </View>
            <View style={styles.listAd}>
              <Text>AD</Text>
              {adBanner}
            </View>
            <View>
              <FlatList
                data={this.state.concepts4}
                renderItem={({ item }) => (
                  <ListItem>
                    <Left>
                      <Text
                        style={{
                          textTransform: "uppercase",
                          color: "#252525",
                          fontSize: 16,
                          fontWeight: "400"
                        }}
                      >
                        {item.name}
                      </Text>
                    </Left>
                    <Right>
                      <View style={styles.percentage4}>
                        <Text style={{ color: "#fff" }}>
                          {`${Math.floor(item.value * 100)}`}%
                        </Text>
                      </View>
                    </Right>
                  </ListItem>
                )}
                keyExtractor={item => item.id}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.container, { marginTop: 40 }]}>
            <Image
              source={require("../assets/waiting-robot.gif")}
              style={{ width: 100, height: 140 }}
            />
          </View>
        )}
      </View>
    );
    return (
      <Container>
        <Header
          noShadow
          style={{
            backgroundColor: "#fff",
            borderBottomColor: "#e6e6e6",
            borderBottomWidth: 1,
            marginTop: StatusBar.currentHeight
          }}
        >
          <StatusBar
            backgroundColor={"transparent"}
            barStyle={"dark-content"}
            translucent
          />
          <Left style={{ flex: 1, flexDirection: "row" }}>
            <Title style={{ color: "#000" }}>Recognizr</Title>
          </Left>
        </Header>
        <Content>
          {imageHolder}
          <TouchableOpacity style={styles.button} onPress={this._captureImage}>
            <Text style={{ color: "#FFF", fontWeight: "500" }}>
              Capture From Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this._pickImage}>
            <Text style={{ color: "#FFF", fontWeight: "500" }}>
              Choose From Library
            </Text>
          </TouchableOpacity>
          {this.state.listLoading ? (
            <View style={{ marginTop: 40 }}>{Loader}</View>
          ) : (
            ConceptsLists
          )}
        </Content>
      </Container>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  androidHeader: {
    ...Platform.select({
      android: {
        paddingTop: StatusBar.currentHeight
      }
    })
  },
  button: {
    marginTop: 30,
    marginHorizontal: 30,
    backgroundColor: "#241663",
    borderRadius: 4,
    height: 42,
    alignItems: "center",
    justifyContent: "center"
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center",
    width: 200,
    height: 200
  },
  uploadActivity: {
    position: "absolute",
    top: 75,
    bottom: 0,
    right: 0,
    left: 0
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#000000",
    opacity: 0.8
  },
  overlay2: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#000000",
    opacity: 0.4
  },
  listAd: {
    borderRadius: 10,
    backgroundColor: "#f7f7f7",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  percentage1: {
    backgroundColor: "#00A572",
    borderRadius: 6,
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center"
  },
  percentage2: {
    backgroundColor: "#50C878",
    borderRadius: 6,
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center"
  },
  percentage3: {
    backgroundColor: "#39FF14",
    borderRadius: 6,
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center"
  },
  percentage4: {
    backgroundColor: "#C7EA46",
    borderRadius: 6,
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center"
  }
});
