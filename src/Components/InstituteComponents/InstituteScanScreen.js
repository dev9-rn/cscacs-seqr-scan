import React, { Component } from 'react';
import { BackHandler, Alert, Platform, StyleSheet, View, TouchableOpacity, StatusBar } from 'react-native';
import { Header, Title, Icon, } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Loader from '../../Utilities/Loader';
import * as utilities from '../../Utilities/utilities';
import { Col, Grid } from 'react-native-easy-grid';
import { URLFORINSTITUTE, APIKEY } from '../../../App';


export default class InstituteScanScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			userId: '',
			userName: '',
			flashEnabled: true,
			flash: false,
			loading: false,
			showCamera: true,
			loaderText: 'Scanning...',
			urlForInstitute: '',
			sessionKey:''
		};
	}
	componentWillMount() { this._getAsyncData(); }
	componentDidMount() {
		this.didFocusSubscription = this.props.navigation.addListener(
			'didFocus',
			payload => {
				this.setState({ showCamera: true });
				// this.scanSuccess = true;
			}
		);
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}
	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
		this.didFocusSubscription.remove();
	}
	handleBackPress = () => {
		this.props.navigation.navigate('InstituteMainScreen');
		return true;
	}
	closeActivityIndicator() {
		setTimeout(() => {
			this.setState({ loading: false });
		});
	}
	async _getAsyncData() {
		await AsyncStorage.getItem('InstituteData', (err, result) => {		// USERDATA is set on SignUP screen
			var lData = JSON.parse(result);
			console.log(result);
			if (lData) {
				this.setState({ userName: lData.data.institute_username,sessionKey: lData.accesstoken, userId: lData.data.id });
				console.log('scan scrren data',JSON.stringify({ userName: lData.data.institute_username,sessionKey: lData.accesstoken, userId: lData.data.id }),null,2)
			}
		});
		AsyncStorage.getItem('InstituteURL', (err, result) => {
			this.setState({ urlForInstitute: result })
		});
	}
	onSuccess(e) {
		this.setState({ showCamera: false });
		this._callForAPI(e);
	}
	async _callForAPI(e) {
		/////////////////////////
		var someText = e.data.replace(/^\s+|\s+$/g, '');
		console.log(someText);

		var a = someText.indexOf("\n");
		var b = someText.substr(0, a);

		var c = someText.substr(a + 1);
		var d = c.indexOf("\n");
		var f = c.substr(0, d);

		var g = c.substr(d + 1);
		var h = g.indexOf("\n");
		var i = g.substr(0, h);

		////////////////////////
		const formData = new FormData();
		let lUserName = this.state.userName;
		//formData.append('key', e.data);
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
		formData.append('device_type', Platform.OS);
		formData.append('scanned_by', lUserName);
		formData.append("user_id", this.state.userId)
		console.log("======formData",formData);
		var lUrl = URLFORINSTITUTE + 'nidan/scan-certificate'
		fetch(lUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart\/form-data',
				'Accept': 'application/json',
				'apikey': APIKEY,
				'accesstoken': this.state.sessionKey
			},
			body: formData,
		}).then(res => res.json())
			.then(lResponseData => {
				this.setState({ loading: false })
				console.log(lResponseData);
				if (!lResponseData) {
					utilities.showToastMsg('Something went wrong. Please try again later');
				} else if (lResponseData.status == '200' ) {
					if (lResponseData.data.scan_result == '1' ) {
					try {
						AsyncStorage.setItem('CERTIFICATESCANNEDDATA', JSON.stringify(lResponseData));
						this.props.navigation.navigate('InstituteCertificateAndPrint', { dataAboveCertificate: someText });
					} catch (error) {
						console.warn(error);
					}
				} else if (lResponseData.data.scan_result == '0') {
					try {
						AsyncStorage.setItem('CERTIFICATESCANNEDDATA', JSON.stringify(lResponseData));
						this.props.navigation.navigate('InstituteCertificateAndPrint', { dataAboveCertificate: someText });
					} catch (error) {
						console.warn(error);
					}
					utilities.showToastMsg('QR code part of the system. But certificate is inactive now');
				} else if (lResponseData.data.scan_result == '2') {
					setTimeout(() => {
						Alert.alert(
							'Scanning Error',
							'Please scan proper QR Code',
							[
								{ text: 'OK', onPress: () => { this.props.navigation.navigate('InstituteMainScreen') } },
							],
							{ cancelable: false }
						)
					}, 500);
				}
			}
				else {
					utilities.showToastMsg('Something went wrong. Please try again later');
				}
			})
			.catch(error => {
				this.setState({ loading: false })
				console.log(error);
			});
	}
	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#D34A44' }}>
					<Grid>
						<Col style={{ justifyContent: 'center' }}>
							<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteMainScreen')}>
								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
							</TouchableOpacity>
						</Col>
						<Col style={{ justifyContent: 'center' }}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Demo SeQR Scan</Title>
						</Col>
						<Col style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
						</Col>
					</Grid>
				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#D34A44' }}>
					<Grid>
						<Col style={{ justifyContent: 'center' }}>
							<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteMainScreen')}>
								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
							</TouchableOpacity>
						</Col>
						<Col style={{ justifyContent: 'center' }}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Demo SeQR Scan</Title>
						</Col>
						<Col style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
						</Col>
					</Grid>
				</Header>
			)
		}
	}
	render() {
		return (
			<View style={styles.container}>
				{this._showHeader()}
				<StatusBar backgroundColor="#D34A44" barStyle="light-content" />
				<Loader loading={this.state.loading} text={this.state.loaderText} />
				{this.state.showCamera ?
					<QRCodeScanner
						onRead={this.onSuccess.bind(this)}
						cameraStyle={{ width: '100%', height: '100%' }}
						showMarker={true}
					/> : <View></View>
				}
			</View>
		)
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

})