import React, { Component } from "react";
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TouchableOpacity } from "react-native";
import { Header, Left, Body, Text, Title, Icon, } from "native-base";
import QRCodeScanner from "react-native-qrcode-scanner";
import Loader from "../../Utilities/Loader";
import * as utilities from "../../Utilities/utilities";
import { scanSeQRData, scanQRData, ISNETCONNECTED } from "../../../App";
import VerifierService from '../services/VerifierService/VerifierService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as app from '../../../App';
export default class VerifierScanScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      userId: "",
      userName: "",
      flashEnabled: true,
      loading: false,
      loaderText: "Scanning...",
      flash: false,
      showCamera: true,
      showCameraText: true,
    };
  }
  componentWillMount() { this._getAsyncData(); }
  componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener("didFocus", payload => { this.setState({ showCamera: true }); });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }
  componentWillUnmount() { BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress); this.didFocusSubscription.remove(); }
  handleBackPress = () => { this.props.navigation.navigate("VerifierMainScreen"); return true; };
  async _getAsyncData() {
    await AsyncStorage.getItem("USERDATA", (err, result) => {
      // USERDATA is set on SignUP screen
      var lData = JSON.parse(result);
      console.log("In scan, user credentials:",JSON.stringify(lData,null,2));
      if (lData) {
        this.setState({ userName: lData.username, userId: lData.id, token: lData.access_token });
      }
    });
  }
  onSuccess(e) {
    this.setState({ showCamera: false });
    this._callForAPI(e);
    console.log(e)
  }

  _callForAPI = async (e) => {
    this.setState({ loading: true, showCameraText: false });

    var someText = e.data.replace(/^\s+|\s+$/g, '');
    console.log("sometext:", someText);

    var a = someText.indexOf("\n");
    // var b = someText.substr(0, a - 1);
    var b = someText.substr(0, a);

    var c = someText.substr(a + 1);
    var d = c.indexOf("\n");
    // var f = c.substr(0, d - 1);
    var f = c.substr(0, d);

    var g = c.substr(d + 1);
    var h = g.indexOf("\n");
    // var i = g.substr(0, h - 1);
    var i = g.substr(0, h);

    // console.log("=-=-=-=-=-=-=-=popopopopo-=-=-==-=>>>>>");

    // var j = g.substr(h + 1);
    // var k = j.indexOf("\n");
    // var l = j.substr(0, k);
    // console.log(l);

    // var m = j.substr(k + 1);
    // var n = m.indexOf("\n");
    // var o = m.substr(0, n);
    // console.log(o);

    // var p = o.substr(n + 1);
    // var q = p.indexOf("\n");
    // var r = p.substr(0, q);
    // console.log(r);


    // var obj = {};
    // obj.name = b;
    // obj.enrollmentNo = f;
    // obj.degree = i;
    // obj.pointer = l;
    // obj.keyForPdf = m.replace(/(\r\n|\n|\r)/gm, "");;
    // console.log(obj);

    const formData = new FormData();
    if (/\n/.test(someText)) {
      formData.append("key", someText.substring(someText.lastIndexOf("\n") + 1));
      someText = someText.substring(someText.lastIndexOf("\n") + 0, -1);
    }
    else if (/\s/.test(someText)) {
      formData.append("key", someText.substring(someText.lastIndexOf(" ") + 1));
      someText = someText.substring(someText.lastIndexOf(" ") + 0, -1);
    }
    else {
      formData.append('key', e.data);
      someText = "";
    }
    formData.append("device_type", Platform.OS);
    formData.append("scanned_by", this.state.userName);
    formData.append("user_id", this.state.userId);

    // if (i) {
    //   formData.append("key", someText.substring(someText.lastIndexOf("\n") + 1));
    //   formData.append("device_type", Platform.OS);
    //   formData.append("scanned_by", this.state.userName);
    //   formData.append("user_id", this.state.userId);
    //   console.log(formData);
    // } else {
    //   formData.append("key", e.data);
    //   formData.append("device_type", Platform.OS);
    //   formData.append("scanned_by", this.state.userName);
    //   formData.append("user_id", this.state.userId);
    // }
    console.log("=====formData",JSON.stringify(formData,null,2));

    var verifierApiObj = new VerifierService();
    await verifierApiObj.scanByPublicUser(formData, this.state.token);
    var lResponseData = verifierApiObj.getRespData();
    this.setState({ loading: false, showCameraText: false });
    if (!lResponseData) {
      utilities.showToastMsg("Something went wrong. Please try again later");
      this.props.navigation.navigate("VerifierMainScreen");
    } else if (lResponseData.data.status === 2) {
      utilities.showToastMsg(lResponseData.data.message);
      this.props.navigation.navigate("VerifierMainScreen");
    } 
    else if (lResponseData.data.status === 0) {
      utilities.showToastMsg(lResponseData.data.message);
      this.props.navigation.navigate("VerifierMainScreen");
    } else if (lResponseData.status === 200) {
      var lData = {};
      lData = lResponseData.data;
      console.log("------------------",lData.status);
      if(lData.status != 0)
      {
      scanSeQRData.unshift(lData);
      utilities.showToastMsg("QR code scanned successfully.");
      await AsyncStorage.setItem("CERTIFICATESCANNEDDATA", JSON.stringify(lResponseData));
      // if (i) {
      this.props.navigation.navigate("CertificateViewScreen", { certificateData: lResponseData.data, dataAboveCertificate: someText });
      }
      else{
        utilities.showToastMsg(lData.message);
        this.props.navigation.navigate("VerifierMainScreen");
      }
      // } else {
      //   this.props.navigation.navigate("CertificateViewScreen", { certificateData: lResponseData.data, dataAboveCertificate: "" });
      // }
    } else {
      utilities.showToastMsg(lResponseData.message);
      setTimeout(() => {
        this.props.navigation.navigate("VerifierMainScreen");
      }, 1000);
    }
  }
  _showHeader() {
    if (Platform.OS == "ios") {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierMainScreen")} >
              <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.9 }}>
            <Title style={{ color: "#FFFFFF" }}>{app.APPNAME}</Title>
          </Body>
        </Header>
      );
    } else {
      return (
        <Header style={{ backgroundColor: "#0000FF" }}>
          <Left style={{ flex: 0.1 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierMainScreen")} >
              <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
            </TouchableOpacity>
          </Left>
          <Body style={{ flex: 0.9, alignItems: "center" }}>
            <Title style={{ color: "#FFFFFF", fontSize: 16 }}>{app.APPNAME}</Title>
          </Body>
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
        {this.state.showCamera ? (<QRCodeScanner onRead={this.onSuccess.bind(this)} cameraStyle={{ width: "100%", height: "100%" }} showMarker={true} />) : (<View />)}
        {/* {this.state.showCameraText ? (<View> <Text style={{ position: "absolute", bottom: 50, left: Dimensions.get("window").width * 0.1, zIndex: 1, color: "#FFFFFF" }}> Point the camera at QR code. </Text> </View>) : (<View />)}  */}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});


// import React, { Component } from 'react';
// import { Alert, StatusBar, Dimensions, Easing, Animated, BackHandler, ScrollView, Platform, View, TouchableOpacity } from 'react-native';
// import { Header, Text, Title, Icon, Card } from 'native-base';
// import QRCodeScanner from 'react-native-qrcode-scanner';
// import Loader from '../../Utilities/Loader';
// import * as utilities from '../../Utilities/utilities';
// import { Col, Grid } from 'react-native-easy-grid';
// import { URL, APIKEY } from '../../../App';
// import { connect } from 'react-redux';
// // import InAppBrowser from 'react-native-inappbrowser-reborn';
// import Pdf from 'react-native-pdf';
// import { Dropdown } from 'react-native-material-dropdown';
// import { changeNameForInstitute } from '../../Redux/Actions/VerifierActions';
// import { bindActionCreators } from 'redux';
// import { WebView } from 'react-native-webview';

// var countOfScans = 0;
// class VerifierScanScreen extends Component {
// 	constructor(props) {
// 		super(props);
// 		console.log(this.props, "usertype");
// 		this.animatedValue = new Animated.Value(0)
// 		this.state = {
// 			userId: '',
// 			userName: '',
// 			flashEnabled: true,
// 			loading: false,
// 			loaderText: 'Scanning...',
// 			flash: false,
// 			showCamera: false,
// 			totalAmount: '',
// 			qrCodes: [],
// 			requestParameter: '',
// 			pdfLists: [],
// 			instituteList: [],
// 			instance: false,
// 			showHideAnimation: false,
// 			showHideBangdu: false,
// 			pay_url:'',
// 			request_id:''
// 		};
// 	}
// 	instituteApi = () => {
// 		this.setState({ loading: true })
// 		const formData = new FormData();
// 		formData.append('type', 'institute');
// 		fetch(`${URL}dropdown`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'multipart\/form-data',
// 				'apikey': APIKEY,
// 				'accesstoken':this.props.accessToken
// 			},
// 			body: formData,
// 		}).then(res => res.json())
// 			.then(response => {
// 				this.setState({ loading: false })
// 				console.log(response);
// 				if (response.status == 200) {
// 					this.setState({ instituteList: response.data })
// 				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 422) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 400) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('StudentLoginScreen') }
// 				else if (response.status == 405) { utilities.showToastMsg(response.message); }
// 			})
// 			.catch(error => {
// 				this.setState({ loading: false })
// 				console.log(error);
// 			});
// 	}
// 	componentDidMount() {
// 		if (!this.state.showCamera) {
// 			this.animate()
// 		}
// 		if (this.props.user_type == 0) {
// 			this.setState({ showCamera: true })
// 		}
// 		countOfScans = 0
// 		this.instituteApi();
// 		this.didFocusSubscription = this.props.navigation.addListener(
// 			'didFocus',
// 			payload => {
// 				if (this.state.instance) {
// 					this.setState({ showCamera: true });
// 				}
// 			}
// 		);
// 		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
// 	}
// 	componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); this.didFocusSubscription.remove(); }
// 	handleBackPress = () => { this.props.navigation.navigate('VerifierMainScreen'); return true; }
// 	onSuccess(e) {
// 		this.setState({ showCamera: false });
// 		this._callForAPI(e);
// 	}
// 	async _callForAPI(e) {
// 		if (countOfScans === 10) {
// 			Alert.alert(
// 				'Alert',
// 				'You cannot scan more than 10.',
// 				[
// 					{ text: 'OK', onPress: () => { this.callApiForPayment() }, style: 'destructive' },
// 				],
// 				{ cancelable: false }
// 			)
// 			return;
// 		}
// 		if (this.state.qrCodes.includes(e.data)) {
// 			Alert.alert(
// 				'You have already scanned this QR code.',
// 				'Do you want to continue scanning.',
// 				[
// 					{ text: 'Make Payment', onPress: () => { this.callApiForPayment() }, style: 'destructive' },
// 					{ text: 'Yes', onPress: () => { this.setState({ showCamera: true }) }, style: 'destructive' },
// 				],
// 				{ cancelable: false }
// 			)
// 			return;
// 		}
// 		this.state.qrCodes.push(e.data)
// 		const formData = new FormData();
// 		formData.append('type', 'validateDocument');
// 		formData.append('user_id', this.props.user_id);
// 		formData.append('key', e.data);
// 		formData.append('user_type', this.props.user_type);
// 		formData.append('institute', this.props.changedInstituteName);
// 		console.log(formData);
// 		console.log(this.props.accessToken);

// 		fetch(`${URL}scan-model`, {
// 			method: 'POST',
// 			headers: {
// 				'Accept': 'application\/json',
// 				'Content-Type': 'multipart\/form-data',
// 				'apikey': APIKEY,
// 				'accesstoken': this.props.accessToken
// 			},
// 			body: formData,
// 		}).then(res => res.json())
// 			.then(response => {
// 				console.log(response);
// 				this.setState({ loading: false })
// 				if (response.status == 200) {
// 					this.setState({ showHideAnimation: true })
// 					if (response.alreadyPaid === 0) {
// 						countOfScans++
// 						this.setState({ totalAmount: Number(this.state.totalAmount) + parseInt(response.amount) })
// 						Alert.alert(
// 							'Scanning Successful',
// 							'Do you want to continue scanning.',
// 							[
// 								{ text: 'Make Payment', onPress: () => { this.callApiForPayment() }, style: 'destructive' },
// 								{ text: 'Yes', onPress: () => { this.setState({ showCamera: true }) }, style: 'destructive' },
// 							],
// 							{ cancelable: false }
// 						)
// 						return;
// 					} else {
// 						countOfScans++
// 						this.setState({ showCamera: false }, () => {
// 							Alert.alert(
// 								response.message,
// 								'Do you want to continue scanning.',
// 								[
// 									{ text: 'View Certificate', onPress: () => { this.callApiForPayment() }, style: 'destructive' },
// 									{ text: 'Yes', onPress: () => { this.setState({ showCamera: true }) }, style: 'destructive' },
// 								],
// 								{ cancelable: false }
// 							)
// 						})
// 					}
// 				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 422) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 400) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
// 				else if (response.status == 405) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 500) { utilities.showToastMsg(response.message); this.setState({ showCamera: true, }), this.state.qrCodes.pop() }
// 			})
// 			.catch(error => {
// 				this.setState({ loading: false })
// 				console.log(error);
// 			});
// 	}
// 	showPdf = () => {
// 		return (
// 			<View style={{ flex: 1, justifyContent: 'center', marginTop: 20, margin: 10 }}>
// 				<ScrollView directionalLockEnabled={false} horizontal={true} keyboardShouldPersistTaps={'handled'}>
// 					{this.state.pdfLists.length > 0 ? this.state.pdfLists.map((data) => (
// 						<Card style={{ flex: 1, height: Dimensions.get('window').height * 0.82, width: Dimensions.get('window').width * 0.94 }}>
// 							<Pdf source={data.pdf_path ? ({ uri: data.pdf_path }) : ""}
// 								onLoadComplete={(numberOfPages, filePath) => { console.log(`number of pages: ${numberOfPages}`); }}
// 								onPageChanged={(page, numberOfPages) => { console.log(`current page: ${page}`); }}
// 								onError={(error) => { console.log(error); }}
// 								style={{ flex: 1 }}
// 							/>
// 						</Card>
// 					)) : <View />}
// 				</ScrollView>
// 			</View>
// 		)
// 	}
	
//   //////////////////////////////////////////
// 	getRequestedDocument = () => {
//         this.setState({ loading: true })
//         const formData = new FormData();
//         formData.append('type', 'getRequestDetails');
//         formData.append('user_id', this.props.user_id);
//         formData.append('request_id', this.state.request_id);
//         formData.append('user_type', this.props.user_type);
//         formData.append('institute', this.props.changedInstituteName);
//         console.log("=-=-=-=-=");
//         console.log(formData);

//         fetch(`${URL}scan-model`, {
//             method: 'POST',
//             headers: {
//                 'Accept': 'application\/json',
//                 'Content-Type': 'multipart\/form-data',
//                 'apikey': APIKEY,
//                 'accesstoken': this.props.accessToken
//             },
//             body: formData,
//         }).then(res => res.json())
//             .then(response => {
//                 console.log("-----",response.data);
//                 this.setState({ loading: false })
//                 if (response.status == 200) {
//                    console.log(response.data[0].data_pdf);
// 				    this.setState ({ pdfLists: response.data[0].data_pdf })
// 					if (response.data[0].pdf_path != "") {
// 						this.showPdf()
// 					}
//                 } else if (response.status == 409) { utilities.showToastMsg(response.message); }
//                 else if (response.status == 422) { utilities.showToastMsg(response.message); }
//                 else if (response.status == 400) { utilities.showToastMsg(response.message); }
//                 else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
//                 else if (response.status == 405) { utilities.showToastMsg(response.message); }
//             })
//             .catch(error => {
//                 this.setState({ loading: false })
//                 console.log("----",error);
//             });
//     }
// //////////////////////////////////////

// 	callApiForPayment = () => {
// 		this.setState({ loading: true });
// 		const formData = new FormData();
// 		formData.append('type', 'saveRequest');
// 		formData.append('user_id', this.props.user_id);
// 		this.state.qrCodes.forEach(element => {
// 			formData.append('qrCodes[]', element);
// 		});
// 		formData.append('totalAmount', this.state.totalAmount);
// 		formData.append('total_files_count', countOfScans);
// 		formData.append('user_type', this.props.user_type);
// 		formData.append('institute', this.props.changedInstituteName);
// 		console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");

		
// 		console.log(formData);

// 		fetch(`${URL}scan-model`, {
// 			method: 'POST',
// 			headers: {
// 				'Accept': 'application\/json',
// 				'Content-Type': 'multipart\/form-data',
// 				'apikey': APIKEY,
// 				'accesstoken': this.props.accessToken
// 			},
// 			body: formData,
// 		}).then(res => res.json())
// 			.then(response => {
// 				console.log(response);
// 				this.setState({ loading: false })
// 				if (response.status == 200) {
// 					// this.state.pdfLists.push(response.dataPdf)
// 					this.setState({ pay_url: response.url,request_id: response.request_id ,requestParameter: response.request_number, pdfLists: response.dataPdf }, () => {
// 						if (response.dataPdf.length > 0) {
// 							this.showPdf()
// 						} else {
// 							console.log(this.setState.pay_url);
// 							this.paymentApi();
// 							return;
// 						}
// 					})
// 				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 422) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 400) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
// 				else if (response.status == 405) { utilities.showToastMsg(response.message); }
// 			})
// 			.catch(error => {
// 				this.setState({ loading: false })
// 				console.log(error);
// 			});
// 	}

// 	paymentApi = async () => {
// 		setTimeout(() => {
// 			this.setState({ showHideBangdu: true })
// 			// const url = `http://192.168.0.5:808/raisoni/verify/functions/payment/payubiz.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}&institute=${this.props.changedInstituteName}&user_type=${this.props.user_type}`
// 			// const url = `https://raisoni.seqronline.com/verify/functions/payment/paytm.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}`
// 			// 	const url = `https://raisoni.seqronline.com/verify/functions/payment_paytm/paytm.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}`
// 			// 	console.log(url);
// 			// 	console.log(APIKEY);
// 			// 	console.log(this.props.accessToken);

// 			// 	InAppBrowser.open(url, {
// 			// 		headers: {
// 			// 			'Content-Type': 'multipart\/form-data',
// 			// 			'apikey': APIKEY,
// 			// 			'accesstoken': this.props.accessToken
// 			// 		},
// 			// 		// iOS Properties
// 			// 		dismissButtonStyle: 'cancel',
// 			// 		preferredBarTintColor: '#453AA4',

// 			// 		// Android Properties
// 			// 		showTitle: true,
// 			// 		toolbarColor: '#6200EE',
// 			// 		secondaryToolbarColor: 'black',
// 			// 		// enableUrlBarHiding: true,
// 			// 		// enableDefaultShare: true,
// 			// 		// forceCloseOnRedirection: true,
// 			// 	}).then((result) => {
// 			// 		console.log(result)
// 			// 		console.log(JSON.stringify(result))

// 			// 		if (result.type === "cancel") {
// 			// 			this.props.navigation.navigate('VerifierMainScreen')
// 			// 		}
// 			// 	})
// 		}, 500);
// 	}

// 	_showHeader() {
// 		if (Platform.OS == 'ios') {
// 			return (
// 				<Header style={{ backgroundColor: '#0000FF' }}>
// 					<Grid>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierMainScreen")}>
// 								<Icon
// 									type="FontAwesome"
// 									name="long-arrow-left"
// 									style={{
// 										fontSize: 25,
// 										color: "#FFFFFF",
// 										paddingLeft: 10,
// 										paddingRight: 10
// 									}}
// 								/>
// 							</TouchableOpacity>
// 						</Col>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<Title style={{ color: "#FFFFFF", fontSize: 17 }}>Demo SeQR Scan</Title>
// 						</Col>
// 						<Col>

// 						</Col>
// 					</Grid>
// 				</Header>
// 			)
// 		} else {
// 			return (
// 				<Header style={{ backgroundColor: "#0000FF" }}>
// 					<Grid>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierMainScreen")}>
// 								<Icon
// 									type="FontAwesome"
// 									name="long-arrow-left"
// 									style={{
// 										fontSize: 25,
// 										color: "#FFFFFF",
// 										paddingLeft: 10,
// 										paddingRight: 10
// 									}}
// 								/>
// 							</TouchableOpacity>
// 						</Col>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<Title style={{ color: "#FFFFFF", fontSize: 17 }}>Demo SeQR Scan</Title>
// 						</Col>
// 						<Col>

// 						</Col>
// 					</Grid>
// 				</Header>
// 			)
// 		}
// 	}

// 	animate() {
// 		this.animatedValue.setValue(0)
// 		Animated.timing(
// 			this.animatedValue,
// 			{
// 				toValue: 1,
// 				duration: 1050,
// 				easing: Easing.linear,
// 				useNativeDriver: false,
// 			}
// 		).start(() => this.animate())
// 	}
// 	handleWebViewNavigationStateChange = (newNavState) => {
// 		console.log("=-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-=");
// 		console.log(newNavState);
// 		// if (newNavState.canGoBack) {
// 		// 	this.setState({ showHideBangdu: false })
// 		// 	this.props.navigation.navigate("VerifierMainScreen")
// 		// }
// 	}
// 	render() {
// 		const opacity = this.animatedValue.interpolate({
// 			inputRange: [0, 0.5, 1],
// 			outputRange: [0, 1, 0]
// 		})
// 		return (
// 			<View style={{ flex: 1 }}>
// 				{!this.state.showHideBangdu ?
// 					<View style={{ flex: 1 }}>
// 						{this._showHeader()}
// 						<StatusBar backgroundColor="#0000FF" />
// 						<Loader loading={this.state.loading} text={this.state.loaderText} />
// 						{this.props.user_type != 0 ?
// 							<View style={{ marginTop: 5, marginLeft: 40, marginRight: 40 }}>
// 								<Dropdown
// 									label={"Select college"}
// 									data={this.state.instituteList}
// 									// pickerStyle={{ height: '50%', marginTop: '20%' }}
// 									baseColor="(default: rgba(0, 0, 0, 5))"
// 									onChangeText={(dataT) => this.setState({ showCamera: true, instance: true, showHideAnimation: true }, () => this.props.changeNameForInstitute(dataT))}
// 								/>
// 							</View> : <View />}
// 						{this.state.showCamera ?
// 							<QRCodeScanner
// 								onRead={this.onSuccess.bind(this)}
// 								cameraStyle={{ width: '100%', height: '100%' }}
// 								showMarker={true}
// 							/> : <View />
// 						}
// 						{this.state.pdfLists.length > 0 && !this.state.showCamera ?
// 							<ScrollView style={{ flex: 1, }}>
// 								{this.showPdf()}
// 							</ScrollView>
// 							: <View />
// 						}
						
// 						{this.props.userType != 0 && !this.state.showHideAnimation && this.props.user_type != 0 ?
// 							<View style={{ flex: 1, justifyContent: 'center' }}>
// 								<Animated.View style={{ opacity }}>
// 									<Icon type="FontAwesome" name="hand-o-up" style={{ fontSize: 200, color: 'red', textAlign: 'center' }} />
// 								</Animated.View>
// 								<Text style={{ textAlign: 'center', color: 'red', fontSize: 30, marginTop: 20, fontWeight: 'bold' }}>Please select college</Text>
// 							</View> : <View />
// 						}

// 					</View>
// 					:
// 					<WebView source={{
// 						// uri: `http://192.168.0.5:808/raisoni/verify/functions/payment/payubiz.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}&institute=${this.props.changedInstituteName}&user_type=${this.props.user_type}`,
// 						// uri: `https://raisoni.seqronline.com/verify/functions/payment_paytm/paytm.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}`,
// 						uri: encodeURI(`${this.state.pay_url}?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}`),
// 						// uri: `https://raisoni.seqrdoc.com/verify/payment/paytm?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}`,

// 						headers: {
// 							'Content-Type': 'multipart\/form-data',
// 							'apikey': APIKEY,
// 							'accesstoken': this.props.accessToken
// 						}
// 					}}
// 						onNavigationStateChange={this.handleWebViewNavigationStateChange}
// 						renderLoading={() => (
//                             <ActivityIndicator
//                               color='black'
//                               size='large'
//                               style={{ flex: 1 }}
//                             />
//                           )}
//                           onMessage={event => {
//                              this.getRequestedDocument();
                          
//                             // this.props.navigation.navigate('VerifierMainScreen');
//                             this.setState({ showHideBangdu: false })
//                           }}
// 					/>
// 				}
// 			</View >
// 		)
// 	}
// }
// const mapStateToProps = (state) => {
// 	return {
// 		accessToken: state.VerifierReducer.LoginData.accessToken,
// 		user_id: state.VerifierReducer.LoginData.id,
// 		full_name: state.VerifierReducer.LoginData.fullname,
// 		user_type: state.VerifierReducer.LoginData.user_type,
// 		email_id: state.VerifierReducer.LoginData.email_id,
// 		mobile_no: state.VerifierReducer.LoginData.mobile_no,
// 		isUserStudent: state.VerifierReducer.LoginData.user_type,
// 		changedInstituteName: state.VerifierReducer.changedInstituteName,
// 	}
// }
// const mapDispatchToProps = (dispatch) => {
// 	return bindActionCreators({ changeNameForInstitute: changeNameForInstitute }, dispatch)
// }
// export default connect(mapStateToProps, mapDispatchToProps)(VerifierScanScreen)