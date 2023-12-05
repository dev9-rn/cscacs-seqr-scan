import React, { Component } from 'react';
import { StatusBar, Alert, BackHandler, Dimensions, Platform, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Header, Card, Text, Title, } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Loader from '../../Utilities/Loader';
import * as utilities from '../../Utilities/utilities';
import { Col, Grid, Row } from 'react-native-easy-grid';
import SplashScreen from 'react-native-splash-screen';
import { URLFORINSTITUTE, APIKEY } from '../../../App';
import { connect } from 'react-redux';

class InstituteMainScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			userName: '',
			sessionKey: '',
			userId: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Loading...',
			urlForInstitute: ''
		};
	}
	componentWillMount() { this._getAsyncData(); }
	componentDidMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackPress); SplashScreen.hide() }
	componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); }
	handleBackPress = () => {
		Alert.alert(
			"Closing Activity",
			"Are you sure you want to close this activity?",
			[{ text: "NO" }, { text: "YES", onPress: () => BackHandler.exitApp() }],
			{ cancelable: false }
		);
	  
		return true;
		// Alert.alert(
		// 	'LOGOUT',
		// 	'Are you sure you want to logout.',
		// 	[
		// 		{ text: 'NO' },
		// 		{ text: 'YES', onPress: () => this._callForLogoutAPI() },
		// 	],
		// 	{ cancelable: false }
		// );
		// return true;
	}
	closeActivityIndicator() { setTimeout(() => { this.setState({ loading: false }); }); }
	async _getAsyncData() {
		await AsyncStorage.getItem('InstituteData', (err, result) => {
			var lData = JSON.parse(result);
			console.log("-=--=-=-==- data =-= -=- = -=-");
			console.log(lData.accesstoken);

			if (lData) {
				let lUserName = lData.data.institute_username.toUpperCase();
				this.setState({ userName: lUserName, sessionKey: lData.accesstoken, userId: lData.data.id });
			}
		});
		AsyncStorage.getItem('InstituteURL', (err, result) => {
			this.setState({ urlForInstitute: result })
		});
	}
	async _callForLogoutAPI() {
		console.log(this.state.urlForInstitute);

		this.setState({ loading: true })
		const formData = new FormData();
		formData.append('user_id', this.state.userId);
	//	formData.append('sesskey', this.state.accesstoken);

		console.log(formData);
		var lUrl = URLFORINSTITUTE + 'logout'
		fetch(lUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart\/form-data',
				'apikey': APIKEY,
				'accesstoken':this.state.sessionKey
			},
			body: formData,
		}).then(res => res.json())
			.then(lResponseData => {
				this.closeActivityIndicator();
				console.log(lResponseData);
				if (!lResponseData) {
					utilities.showToastMsg('Something went wrong. Please try again later');
				} else if (lResponseData.status == '200') {
					AsyncStorage.clear();
					this.props.navigation.navigate('HomeScreen');
					utilities.showToastMsg('Logged out successfully');
				} else {
					utilities.showToastMsg('Something went wrong. Please try again later');
				}
			})
			.catch(error => {
				this.closeActivityIndicator();
				console.log(error);
			});
	}
	_aboutUs() { this.props.navigation.navigate('AboutUs'); }
	_logOut() { this._callForLogoutAPI(); }
	_openScanner() { this.props.navigation.navigate('InstituteScanScreen'); }
	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#D34A44' }}>
					<Grid>
						<Col>
						</Col>
						<Col style={{ justifyContent: 'center' }}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Demo SeQR Scan</Title>
						</Col>
						<Col style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
							<Menu>
								<MenuTrigger>
									<Image style={{ width: 20, height: 20, paddingRight: 15 }} source={require('../../images/three_dots.png')} />
								</MenuTrigger>
								<MenuOptions>
									<MenuOption onSelect={() => this._aboutUs()} style={{ padding: 15 }}>
										<Text style={{ color: 'black' }}>About us</Text>
									</MenuOption>
									<MenuOption onSelect={() => this._logOut()} style={{ padding: 15 }} >
										<Text style={{ color: 'black' }}>Logout</Text>
									</MenuOption>
								</MenuOptions>
							</Menu>
						</Col>
					</Grid>
				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#D34A44' }}>
					<Grid>
						<Col>
						</Col>
						<Col style={{ justifyContent: 'center' }}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Demo SeQR Scan</Title>
						</Col>
						<Col style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
							<Menu>
								<MenuTrigger>
									<Image style={{ width: 20, height: 20, paddingRight: 15 }} source={require('../../images/three_dots.png')} />
								</MenuTrigger>
								<MenuOptions>
									<MenuOption onSelect={() => this._aboutUs()} style={{ padding: 15 }}>
										<Text style={{ color: 'black' }}>About us</Text>
									</MenuOption>
									<MenuOption onSelect={() => this._logOut()} style={{ padding: 15 }} >
										<Text style={{ color: 'black' }}>Logout</Text>
									</MenuOption>
								</MenuOptions>
							</Menu>
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
				<View>
					<Text style={{ textAlign: 'center', paddingTop: 10 }}>WELCOME {this.state.userName}</Text>
				</View>
				<View style={styles.homeViewContainer}>
					<Card style={styles.cardContainer}>
						<TouchableOpacity onPress={() => this._openScanner()}>
							<View style={{ marginTop: 10, alignItems: 'center', }}>
								<Image style={{ width: 150, height: 150 }} source={require('../../images/mob_barcode_Institute.png')} />
								<Text style={{ padding: 10 }}>SCAN AND VIEW CERTIFICATE</Text>
							</View>
						</TouchableOpacity>
					</Card>
					<Card style={styles.cardContainer}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('InstituteAuditScanScreen')}>
							<View style={{ marginTop: 10, alignItems: 'center' }}>
								<Image style={{ width: 150, height: 150 }} source={require('../../images/audit_scan_institute.png')} />
								<Text style={{ padding: 10 }}>SCAN AND VIEW AUDIT TRAILS</Text>
							</View>
						</TouchableOpacity>
					</Card>
				</View>
			</View>
		)
	}
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	homeViewContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingTop: Dimensions.get('window').height * 0.01
	},
	cardContainer: {
		flex: 1,
		padding: 10,
		marginBottom: 10,
		marginLeft: 30,
		marginRight: 30,
		justifyContent: 'center',
	},
})
const mapStateToProps = (state) => {
	console.log(state);

	return {
		// accessToken: state.VerifierReducer.LoginData.accessToken,
	}
}
// const mapDispatchToProps = (dispatch) => {
//     return bindActionCreators({ clearStore: clearTheStoreOnLogout }, dispatch)
// }
export default connect(mapStateToProps, null)(InstituteMainScreen)