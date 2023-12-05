import React, { Component } from "react";
import {
  Alert,
  StatusBar,
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView
} from "react-native";
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Content,
  Card,
  CardItem,
  Text,
  Title,
  Item,
  Icon,
  Toast
} from "native-base";
import LoginService from '../services/LoginService/LoginService'
import Loader from '../../Utilities/Loader';
import * as utilities from "../../Utilities/utilities";
import * as app from "../../../App";
// import { scanSeQRData } from '../../../App';
import SplashScreen from 'react-native-splash-screen';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";

import AsyncStorage from '@react-native-async-storage/async-storage';



export default class VerifierMainScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userName: "",
      borderBottomColorPassword: "#757575",
      borderBottomColorUserName: "#757575",
      loading: false,
      loaderText: "Please wait..."
    
    };
  }

  componentWillMount() {
    this._getAsyncData();
  }

  componentDidMount() {
    SplashScreen.hide()
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  handleBackPress = () => {
    Alert.alert(
      "Closing Activity",
      "Are you sure you want to close this activity?",
      [{ text: "NO" }, { text: "YES", onPress: () => BackHandler.exitApp() }],
      { cancelable: false }
    );

    return true;
  };

  closeActivityIndicator() {
    setTimeout(() => {
      this.setState({ animating: false, loading: false });
    });
  }

  async _getAsyncData() {
    await AsyncStorage.getItem("USERDATA", (err, result) => {
      // USERDATA is set on SignUP screen
      var lData = JSON.parse(result);
      console.log(result);
      if (lData) {
        this.setState({
          userName: lData.username,
          userId: lData.id,
          sessionKey: lData.access_token
        });
      }
    });
  }

  async _callForLogoutAPI() {
    // const formData = new FormData();
    // formData.append("user_id", this.state.userId);
    // formData.append("sesskey", this.state.sessionKey);

    var loginApiObj = new LoginService();
    this.setState({ loading: true, loaderText: "Logging out..." });
    await loginApiObj.logOut(this.state.sessionKey);
    var lResponseData = loginApiObj.getRespData();
    this.closeActivityIndicator();
    console.log(lResponseData);

    if (!lResponseData) {
      utilities.showToastMsg("Something went wrong. Please try again later");
    } else if (lResponseData.status == 200) {
      AsyncStorage.clear();
      app.scanSeQRData.length = 0;
      this.props.navigation.navigate("HomeScreen");
      utilities.showToastMsg("Logged out successfully");
    } else {
      utilities.showToastMsg("Something went wrong. Please try again later");
    }
  }

  _aboutUs() {
    this.props.navigation.navigate("AboutUs", { screen: "VerifierMainScreen" });
  }

  _removeAccount(){
		// utilities.showToastMsg("Account removed successfully");
		this.props.navigation.navigate('RemoveAccount'); 
	}

  _logOut() {
    if (app.ISNETCONNECTED) {
      this._callForLogoutAPI();
    } else {
      utilities.showToastMsg(
        "No network available! Please check the connectivity settings and try again."
      );
    }
  }

  _openScanner() {
    this.props.navigation.navigate("VerifierScanScreen");
  }

  _showHeader() {
    if (Platform.OS == "ios") {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Title style={{ color: "#FFFFFF", fontSize: 16, textAlign: "center" }}>
              {app.APPNAME}
            </Title>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Menu>
              <MenuTrigger>
                <Image
                  style={{ width: 20, height: 20, paddingRight: 15 }}
                  source={require("../../images/three_dots.png")}
                />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption
                  onSelect={() => this._aboutUs()}
                  style={{ padding: 15 }}
                >
                  <Text style={{ color: "black" }}>About us</Text>
                </MenuOption>
                <MenuOption onSelect={() => this._removeAccount()} style={{ padding: 15 }}>
									<Text style={{ color: 'red' }}>Remove Account</Text>
									</MenuOption>
                <MenuOption
                  onSelect={() => this._logOut()}
                  style={{ padding: 15 }}
                >
                  <Text style={{ color: "black" }}>Logout</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        </Header>
      );
    } else {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Title style={{ color: "#FFFFFF", fontSize: 16, textAlign: "center" }}>
              {app.APPNAME}
            </Title>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Menu>
              <MenuTrigger>
                <Image
                  style={{ width: 20, height: 20, paddingRight: 15 }}
                  source={require("../../images/three_dots.png")}
                />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption
                  onSelect={() => this._aboutUs()}
                  style={{ padding: 15 }}
                >
                  <Text style={{ color: "black" }}>About us</Text>
                </MenuOption>
                <MenuOption onSelect={() => this._removeAccount()} style={{ padding: 15 }}>
									<Text style={{ color: 'red' }}>Remove Account</Text>
									</MenuOption>
                <MenuOption
                  onSelect={() => this._logOut()}
                  style={{ padding: 15 }}
                >
                  <Text style={{ color: "black" }}>Logout</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        </Header>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this._showHeader()}
        <StatusBar barStyle="light-content" />

        <Loader loading={this.state.loading} text={this.state.loaderText} />

        <View>
          <Text style={{ textAlign: "center", paddingTop: 10 }}>
            WELCOME {this.state.userName.toUpperCase()}
          </Text>
        </View>
        <View style={styles.homeViewContainer}>
          <Card style={styles.cardContainer}>
            <TouchableOpacity onPress={() => this._openScanner()}>
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Image
                  style={{ width: 150, height: 150 }}
                  source={require("../../images/mob_barcode_blue.png")}
                />
                <Text style={{ padding: 10 }}>SCAN AND VIEW CERTIFICATE</Text>
              </View>
            </TouchableOpacity>
          </Card>
          <Card style={styles.cardContainer}>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate("VerifierScanHistory")
              }
            >
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Image
                  style={{ width: 150, height: 150 }}
                  source={require("../../images/mob_barcode_history.png")}
                />
                <Text style={{ padding: 10 }}>VIEW HISTORY</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  homeViewContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: Dimensions.get("window").height * 0.01
  },
  cardContainer: {
    flex: 1,
    padding: 15,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    justifyContent: "center"
  },
  buttonVerifier: {
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#0000FF",
    borderRadius: 5
  },
  buttonText: {
    padding: 10,
    color: "white"
  }
});
const drawerStyles = {
  drawer: { shadowColor: "#000000", shadowOpacity: 0.8, shadowRadius: 3 },
  main: { paddingLeft: 3 }
};

// <Drawer
//         		ref={(ref) => this._drawer = ref}
//         		styles={drawerStyles}
//         		tapToClose={true}
//         		openDrawerOffset={200}

// 		        content={<SideMenu />}
// 		        tweenHandler={(ratio) => ({ main: { opacity:(2-ratio)/2 } })}
// 		        >
//



// import React, { Component } from 'react';
// import { Alert, StatusBar, Animated, BackHandler, Platform, View, Image, TouchableOpacity, ScrollView } from 'react-native';
// import { Header, Card, Text, Title } from 'native-base';
// import Loader from '../../Utilities/Loader';
// import * as utilities from '../../Utilities/utilities';
// import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
// import { connect } from 'react-redux';
// import { URL, APIKEY } from '../../../App';
// import { bindActionCreators } from 'redux';
// import { clearTheStoreOnLogout } from '../../Redux/Actions/VerifierActions';
// import { Col, Grid, Row } from 'react-native-easy-grid';
// import SplashScreen from 'react-native-splash-screen';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// class VerifierMainScreen extends Component {
// 	constructor(props) {
// 		super(props);
// 		this.springValue = new Animated.Value(0.3)
// 		this.state = {
// 			userName: '',
// 			borderBottomColorPassword: '#757575',
// 			borderBottomColorUserName: '#757575',
// 			loading: false,
// 			loaderText: 'Please wait...',
// 		};
// 	}
// 	animate() {
// 		this.springValue.setValue(0.3)
// 		Animated.spring(
// 			this.springValue,
// 			{
// 				toValue: 1,
// 				friction: 1
// 			}
// 		).start(() => this.animate())
// 	}
// 	componentDidMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackPress); SplashScreen.hide(), this.animate() }
// 	componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); }
// 	handleBackPress = () => {
// 		// Alert.alert(
// 		// 	'LOGOUT',
// 		// 	'Are you sure you want to logout.',
// 		// 	[
// 		// 		{ text: 'NO' },
// 		// 		{ text: 'YES', onPress: () => this._callForLogoutAPI() },
// 		// 	],
// 		// 	{ cancelable: false }
// 		// );
// 		// return true;
// 		Alert.alert(
// 			"Closing Activity",
// 			"Are you sure you want to close this activity?",
// 			[{ text: "NO" }, { text: "YES", onPress: () => BackHandler.exitApp() }],
// 			{ cancelable: false }
// 		  );
	  
// 		return true;
// 	}
// 	_callForLogoutAPI = () => {
// 		const formData = new FormData();
// 		formData.append('type', 'logout');
// 		formData.append('institute', this.props.changedInstituteName);
// 		formData.append('user_id', this.props.user_id);
// 		formData.append('user_type', this.props.userType);
// 		console.log(formData);
// 		fetch(`${URL}login`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'multipart\/form-data',
// 				'Accept': 'application/json',
// 				'apikey': APIKEY,
// 				'accesstoken': this.props.accessToken ? this.props.accessToken : ''
// 			},
// 			body: formData,
// 		}).then(res => res.json())
// 			.then(response => {
// 				this.setState({ loading: false })
// 				console.log(response);
// 				if (response.status == 200) {
// 					this.props.clearStore('clearData')
// 					AsyncStorage.clear();
// 					this.props.navigation.navigate('HomeScreen');
// 					utilities.showToastMsg(response.message);

// 				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 422) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 400) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
// 				else if (response.status == 405) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 500) { utilities.showToastMsg(response.message); }
// 			})
// 			.catch(error => {
// 				this.setState({ loading: false })
// 				console.log(error);
// 			});
// 	}
// 	_aboutUs() { this.props.navigation.navigate('AboutUs'); }
// 	_removeAccount(){
// 		// utilities.showToastMsg("Account removed successfully");
// 		this.props.navigation.navigate('RemoveAccount'); 
// 	  }

	  
// 	_showHeader() {
// 		if (Platform.OS == 'ios') {
// 			return (
// 				<Header style={{ backgroundColor: '#0000FF' }}>
// 					<Grid>
// 						<Col>
// 						</Col>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Demo SeQR Scan</Title>
// 						</Col>
// 						<Col style={{ justifyContent: 'center', alignItems: 'flex-end', marginRight: 3 }}>
// 							<Menu>
// 								<MenuTrigger>
// 									<Image
// 										style={{ width: 20, height: 20, paddingRight: 15 }}
// 										source={require('../../images/three_dots.png')}
// 									/>
// 								</MenuTrigger>
// 								<MenuOptions>
// 									<MenuOption onSelect={() => this._aboutUs()} style={{ padding: 15 }}>
// 										<Text style={{ color: 'black' }}>About us</Text>
// 									</MenuOption>
// 									<MenuOption onSelect={() => this._removeAccount()} style={{ padding: 15 }}>
// 										<Text style={{ color: 'red' }}>Remove Account</Text>
// 									</MenuOption>
// 									<MenuOption onSelect={() => this._callForLogoutAPI()} style={{ padding: 15 }} >
// 										<Text style={{ color: 'black' }}>Logout</Text>
// 									</MenuOption>
// 								</MenuOptions>
// 							</Menu>
// 						</Col>
// 					</Grid>
// 				</Header>
// 			)
// 		} else {
// 			return (
// 				<Header style={{ backgroundColor: '#0000FF' }}>
// 					<Grid>
// 						<Col>
// 						</Col>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Demo SeQR Scan</Title>
// 						</Col>
// 						<Col style={{ justifyContent: 'center', alignItems: 'flex-end', marginRight: 3 }}>
// 							<Menu>
// 								<MenuTrigger>
// 									<Image
// 										style={{ width: 20, height: 20, paddingRight: 15 }}
// 										source={require('../../images/three_dots.png')}
// 									/>
// 								</MenuTrigger>
// 								<MenuOptions>
// 									<MenuOption onSelect={() => this._aboutUs()} style={{ padding: 15 }}>
// 										<Text style={{ color: 'black' }}>About us</Text>
// 									</MenuOption>
// 									<MenuOption onSelect={() => this._removeAccount()} style={{ padding: 15 }}>
// 										<Text style={{ color: 'red' }}>Remove Account</Text>
// 									</MenuOption>
// 									<MenuOption onSelect={() => this._callForLogoutAPI()} style={{ padding: 15 }} >
// 										<Text style={{ color: 'black' }}>Logout</Text>
// 									</MenuOption>
// 								</MenuOptions>
// 							</Menu>
// 						</Col>
// 					</Grid>
// 				</Header>
// 			)
// 		}
// 	}
// 	render() {
// 		const textSize = this.springValue.interpolate({
// 			inputRange: [0, 0.5, 1],
// 			outputRange: [10, 15, 18]
// 		})
// 		return (
// 			<ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps={'handled'}>
// 				{this._showHeader()}
// 				<StatusBar backgroundColor="#0000FF" />
// 				<Loader loading={this.state.loading} text={this.state.loaderText} />
// 				<View>
// 					<Grid style={{ marginTop: 10 }}>
// 						<Col style={{ justifyContent: 'center' }} >
// 							<Text style={{ textAlign: 'right', }}>WELCOME : </Text>
// 						</Col>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<Text style={{ textAlign: 'left', fontWeight: 'bold', }}>{this.props.fullname.toUpperCase()}</Text>
// 						</Col>
// 					</Grid>
// 					{/* <Animated.Text
// 						style={{
// 							fontSize: textSize,
// 							marginTop: 1,
// 							textAlign: 'center', fontWeight: 'bold',
// 						}} >
// 						{this.props.full_name.toUpperCase()}
// 					</Animated.Text> */}
// 					{/* <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{this.props.full_name.toUpperCase()}</Text> */}
// 				</View>
// 				<Grid style={{ margin: 15 }}>
// 					<Row>
// 						<Col style={{ marginRight: 10 }}>
// 							<Card style={{ height: 220 }}>
// 								<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierScanScreen')}>
// 									<View style={{ marginTop: 10, alignItems: 'center', }}>
// 										<Image
// 											style={{ width: 150, height: 150 }}
// 											source={require('../../images/mob_barcode_blue_1.png')}
// 										/>
// 										<Text style={{ padding: 10, textAlign: 'center', fontWeight: 'bold' }}>SCAN AND VIEW CERTIFICATE</Text>
// 									</View>
// 								</TouchableOpacity>
// 							</Card>
// 						</Col>
// 						<Col>
// 							<Card style={{ height: 220 }}>
// 								<TouchableOpacity onPress={() => this.props.navigation.navigate('RequestVerification')}>
// 									<View style={{ marginTop: 10, alignItems: 'center', }}>
// 										<Image
// 											style={{ width: 150, height: 150 }}
// 											source={require('../../images/form_orange.png')}
// 										/>
// 										<Text style={{ padding: 10, textAlign: 'center', fontWeight: 'bold' }}>REQUEST VERIFICATION</Text>
// 									</View>
// 								</TouchableOpacity>
// 							</Card>
// 						</Col>
// 					</Row>
// 					<Row style={{ marginTop: 20 }}>
// 						<Col style={{ marginRight: 10 }}>
// 							<Card style={{ height: 220 }}>
// 								<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierScanHistory')}>
// 									<View style={{ marginTop: 10, alignItems: 'center' }}>
// 										<Image
// 											style={{ width: 150, height: 150 }}
// 											source={require('../../images/mob_barcode_history.png')}
// 										/>
// 										<Text style={{ padding: 10, textAlign: 'center', fontWeight: 'bold' }}>VIEW HISTORY</Text>
// 									</View>
// 								</TouchableOpacity>
// 							</Card>
// 						</Col>
// 						<Col>
// 							<Card style={{ height: 220 }}>
// 								<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierStatusScreen')}>
// 									<View style={{ marginTop: 10, alignItems: 'center' }}>
// 										<Image
// 											style={{ width: 150, height: 155 }}
// 											source={require('../../images/hour_glass.png')}
// 										/>
// 										<Text style={{ padding: 10, textAlign: 'center', fontWeight: 'bold' }}>Verification Status</Text>
// 									</View>
// 								</TouchableOpacity>
// 							</Card>
// 						</Col>
// 					</Row>
// 					<Col>
// 						<Card style={{ width: 235, marginTop: 20, alignSelf: 'center' }}>
// 							<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierProfileScreen')}>
// 								<View style={{ marginTop: 10, alignItems: 'center' }}>
// 									<Image
// 										style={{ width: 130, height: 130 }}
// 										source={require('../../images/accountimage.png')}
// 									/>
// 									<Text style={{ textAlign: 'center', fontWeight: 'bold', paddingTop: 1 }}>MY ACCOUNT</Text>
// 								</View>
// 							</TouchableOpacity>
// 						</Card>
// 						<Text></Text>
// 					</Col>
// 				</Grid>
// 			</ScrollView>
// 		)
// 	}
// };
// const mapStateToProps = (state) => {
// 	return {
// 		fullname: state.VerifierReducer.LoginData ? state.VerifierReducer.LoginData.fullname : "",
// 		user_id: state.VerifierReducer.LoginData ? state.VerifierReducer.LoginData.id : "",
// 		accessToken: state.VerifierReducer.LoginData ? state.VerifierReducer.LoginData.access_token : "",
// 		changedInstituteName: state.VerifierReducer.LoginData ? state.VerifierReducer.changedInstituteName : "",
// 		userType: state.VerifierReducer.LoginData ? state.VerifierReducer.LoginData.user_type : ""
// 	}
// }
// const mapDispatchToProps = (dispatch) => {
// 	return bindActionCreators({ clearStore: clearTheStoreOnLogout }, dispatch)
// }
// export default connect(mapStateToProps, mapDispatchToProps)(VerifierMainScreen)