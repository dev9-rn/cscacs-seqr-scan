import React, { Component } from 'react';
import { Alert, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import {
	Container, Header, Left, Body, Right, Content, Card, CardItem, Text,
	Title, Item, Label, Toast, InputGroup, Input, Icon, Form
} from 'native-base';
import LoginService from '../../Components/services/LoginService/LoginService';
// import RadioGroup from 'react-native-custom-radio-group';
// import {radioGroupList} from './radioGroupList.js';
// import OfflineNotice from '../../Utilities/OfflineNotice';
import Loader from '../../Utilities/Loader';
import * as utilities from '../../Utilities/utilities';
import * as app from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class VerifierSignupScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isConnected: true,
			name: '',
			email: '',
			phoneNumber: '',
			userName: '',
			password: '',
			confirmPassword: '',
			verification: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Signing you up...',
			nameError: null,
			emailError: null,
			phoneNumberError: null,
			userNameError: null,
			passwordError: null,
			confirmPasswordError: null,
			btnOTP: 'active',
			btnEmail: 'inactive',
		};
	}

	componentWillMount() {
		this.setState({ isConnected: app.ISNETCONNECTED });
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		// this._showNetErrMsg();
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress = () => {
		this.props.navigation.navigate('VerifierLoginScreen');
		return true;
	}

	_showNetErrMsg() {
		if (!this.state.isConnected || !app.ISNETCONNECTED) {
			Alert.alert(
				'No network available',
				'Connect to internet to scan SeQR. Without internet you can only scan non secured public QR codes.',
				[
					{ text: 'SETTINGS', onPress: () => { } },
					{ text: 'BACK', onPress: () => { this.props.navigation.navigate('VerifierMainScreen') } },
					{ text: 'CONTINUE', onPress: () => { this.setState({ isConnected: false }) } },
				],
				{ cancelable: false }
			)
		}
	}
	closeActivityIndicator() {
		setTimeout(() => {
			this.setState({ loading: false });
		});
	}

	_validateName() {
		let lName = this.state.name;
		let res = utilities.checkSpecialChar(lName);
		if (!res) {
			this.setState({ nameError: "Special characters are not allowed." });
		}
		return res;
	}

	_validateEmail() {
		let lEmail = this.state.email;
		let res = utilities.checkEmail(lEmail);
		if (!res) {
			this.setState({ emailError: "This email address is invalid" });
		}
		return res;
	}

	_validateUserName() {
		let lUserName = this.state.userName;
		let res = utilities.checkSpecialChar(lUserName);
		if (!res) {
			this.setState({ userNameError: "Special characters are not allowed." });
		}
		return res;
	}

	_validatePassword() {
		let lPassword = this.state.password;
		let lConfirmPassword = this.state.confirmPassword;
		let result = '';
		if (lPassword.trim().length >= 8 && lConfirmPassword.trim().length >= 8) {
			if (lPassword == lConfirmPassword && lPassword != '') {
				result = true;
			} else {
				res = false;
				this.setState({ confirmPasswordError: "Password mismatch" });
			}
		} else {
			result = false;
			if (lPassword.trim().length < 8) {
				this.setState({ passwordError: "Password is short, min 8 characters." });
			} else {
				this.setState({ confirmPasswordError: "Password is short, min 8 characters." });
			}
		}
		return result;
	}

	_validateMobileNumber() {
		let lPhoneNumber = this.state.phoneNumber;
		let res = '';
		res = utilities.checkMobileNumber(lPhoneNumber);
		if (!res || lPhoneNumber.trim().length < 10) {
			this.setState({ phoneNumberError: "This phone number appears to be invalid." });
		}
		return res;
	}

	async callForAPI() {
		let lName = this.state.name.trim();
		let lEmail = this.state.email.trim();
		let lPhoneNumber = this.state.phoneNumber;
		let lUserName = this.state.userName;
		let lPassword = this.state.password;
		let lVerification = 1;
		if (this.state.btnOTP == 'active') {
			lVerification = 1;		// verify through OTP 
		} else {
			lVerification = 2;		// verify through Email
		}
		const formData = new FormData();
		formData.append('username', lUserName);
		formData.append('fullname', lName);
		formData.append('password', lPassword);
		formData.append('email_id', lEmail);
		formData.append('mobile_no', lPhoneNumber);
		formData.append('verify_by', lVerification);
		// formData.append('action', 'register');

		var loginApiObj = new LoginService();
		// this.props.navigation.navigate('OTPVerification');

		this.setState({ loading: true });
		await loginApiObj.registration(formData);
		var lResponseData = loginApiObj.getRespData();
		console.log(lResponseData);
		this.setState({ loading: false });
		if (lResponseData.status == 200) {
			utilities.showToastMsg(lResponseData.message);
			if (lVerification === 1) {
				await AsyncStorage.setItem('OTPDATA', JSON.stringify(lResponseData.data));
				this.props.navigation.navigate('OTPVerification', lPhoneNumber);
			} else {
				this.props.navigation.navigate('VerifierLoginScreen', lPhoneNumber);
			}
		} else if (lResponseData.status == 400) {
			utilities.showToastMsg(lResponseData.message);
			return;
		} else {
			utilities.showToastMsg(lResponseData.message);
			return;
		}

		// if (!lResponseData) {
		// 	this.closeActivityIndicator();
		// 	utilities.showToastMsg('Something went wrong. Please try again later');
		// } else if (lResponseData.status == false && lResponseData.code == 501) {
		// 	this.closeActivityIndicator();
		// 	this.setState({ phoneNumberError: "Mobile no. already exists" });
		// 	// utilities.showToastMsg('Mobile no. already exists');
		// } else if (lResponseData.status == false && lResponseData.code == 502) {
		// 	this.closeActivityIndicator();
		// 	this.setState({ emailError: "Email ID already exists" });
		// 	// utilities.showToastMsg('Email ID already exists');
		// } else if (lResponseData.status == false && lResponseData.code == 503) {
		// 	this.closeActivityIndicator();
		// 	this.setState({ userNameError: "Username already exists" });
		// 	// utilities.showToastMsg('Username already exists');
		// } else if (lResponseData.status == true && lResponseData.verification_method == '1') {
		// 	this.closeActivityIndicator();
		// 	utilities.showToastMsg('OTP send to your mobile number');
		// 	try {
		// 		await AsyncStorage.setItem('OTPDATA', JSON.stringify(lResponseData));
		// 		this.props.navigation.navigate('OTPVerification');
		// 	} catch (error) {
		// 		console.log(error);
		// 	}
		// } else if (lResponseData.status == true && lResponseData.verification_method == '2') {
		// 	// utilities.showToastMsg('OTP send to your email address');
		// 	setTimeout(() => {
		// 		this.setState({ animating: false, loading: false });
		// 	}, 2000);
		// 	try {
		// 		await AsyncStorage.setItem('OTPDATA', JSON.stringify(lResponseData));
		// 		// this.props.navigation.navigate('OTPVerification');
		// 		Alert.alert(
		// 			'Verify email id',
		// 			'Verify email id and login again to SeQR scan',
		// 			[
		// 				{ text: 'OK', onPress: () => this.props.navigation.navigate(VerifierLoginScreen) },
		// 			],
		// 			{ cancelable: false }
		// 		)
		// 	} catch (error) {
		// 		console.log(error);
		// 	}
		// } else {
		// 	this.closeActivityIndicator();
		// 	utilities.showToastMsg('Something went wrong. Please try again later');
		// }

	}

	_onPressButton() {
		if (!app.ISNETCONNECTED) {
			utilities.showToastMsg('No network available! Please check the connectivity settings and try again.');

		} else {
			let lName = this.state.name;
			let lEmail = this.state.email;
			let lPhoneNumber = this.state.phoneNumber;
			let lUserName = this.state.userName;
			let lPassword = this.state.password;
			let lConfirmPassword = this.state.confirmPassword;
			let lVerification = this.state.verification;
			var isValidName = '';
			var isValidUserName = '';
			var isValidPassword = '';
			var isValidMobileNumber = '';
			var isValidEmail = '';

			;
			if (lName === "") {
				this.setState({ nameError: "Name is required." });
				return;
			} else {
				this.setState({ nameError: null });
			}

			if (lEmail === "") {
				this.setState({ emailError: "Email required." });
				return;
			} else {
				this.setState({ emailError: null });
			}

			if (lPhoneNumber === "") {
				this.setState({ phoneNumberError: "Phone number required." });
				return;
			} else {
				this.setState({ phoneNumberError: null });
			}

			if (lUserName === "") {
				this.setState({ userNameError: "User name required." });
				return;
			} else {
				this.setState({ userNameError: null });
			}

			if (lPassword === "") {
				this.setState({ passwordError: "Password required." });
				return;
			} else {
				this.setState({ passwordError: null });
			}

			if (lConfirmPassword === "") {
				this.setState({ confirmPasswordError: "Confirm password required." });
				return;
			} else {
				this.setState({ confirmPasswordError: null });
			}

			if (this.state.nameError == null && this.state.emailError == null && this.state.phoneNumberError == null && this.state.userNameError == null && this.state.passwordError == null && this.state.confirmPasswordError == null) {
				;
				isValidName = this._validateName();
				isValidUserName = this._validateUserName();
				isValidMobileNumber = this._validateMobileNumber();
				isValidPassword = this._validatePassword();
				isValidEmail = this._validateEmail();

				if (isValidName && isValidEmail && isValidUserName && isValidPassword && isValidMobileNumber) {
					this.callForAPI();
				}

			} else {
				if (lName != "") {
					lName = '';
					isValidName = this._validateName();
				}
				if (lEmail != '') {
					lEmail = '';
					isValidEmail = this._validateEmail();
				}
				if (lPhoneNumber != '') {
					lPhoneNumber = '';
					isValidMobileNumber = this._validateMobileNumber();
				}
				if (lUserName) {
					lUserName = '';
					isValidUserName = this._validateUserName();
				}
				if (lPassword != '') {
					lPassword = '';
					isValidPassword = this._validatePassword();
				}
			}
		}
	}

	_verficationButton() {
		if (this.state.btnOTP == 'active') {
			return (
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
					<TouchableOpacity onPress={() => { this.setState({ btnEmail: 'inactive' }) }} >
						<View style={styles.buttonOTP}>
							<Image
								style={{ width: 20, height: 22, marginTop: 1 }}
								source={require('../../images/otpOn.png')}
							/>
							<Text style={styles.buttonTextOTP}>OTP</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => { this.setState({ btnOTP: 'inactive', btnEmail: 'active' }) }} >
						<View style={styles.buttonEmailOff}>
							<Text style={styles.buttonTextEmailOff}>Email</Text>
							<Icon type="FontAwesome" name="envelope" style={{ fontSize: 16, color: '#33B5E5', marginLeft: 5 }} />
						</View>
					</TouchableOpacity>
				</View>
			)
		} else {
			return (
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
					<TouchableOpacity onPress={() => { this.setState({ btnEmail: 'inactive', btnOTP: 'active' }) }} >
						<View style={styles.buttonOTPOff}>
							<Image
								style={{ width: 20, height: 22, marginTop: 1 }}
								source={require('../../images/otpOff.png')}
							/>
							<Text style={styles.buttonTextOTPOff}>OTP</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => { this.setState({ btnOTP: "inactive" }) }} >
						<View style={styles.buttonEmail}>
							<Text style={styles.buttonTextEmail}>Email</Text>
							<Icon type="FontAwesome" name="envelope" style={{ fontSize: 16, color: '#FFFFFF', marginLeft: 5 }} />
						</View>
					</TouchableOpacity>
				</View>
			)
		}

	}

	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierLoginScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9 }}>
						<Title style={{ color: '#FFFFFF' }}>{app.title}</Title>
					</Body>

				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left style={{ flex: 0.1 }}>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierLoginScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ flex: 0.9, alignItems: 'center' }}>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>{app.title}</Title>
					</Body>

				</Header>
			)
		}
	}

	render() {
		return (
			<View style={styles.container}>

				{this._showHeader()}
				{/* <OfflineNotice /> */}
				<StatusBar
				backgroundColor={"#0000FF"}
					barStyle="light-content"
				/>

				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>

				<View style={styles.signUpViewContainer}>
					<ScrollView keyboardShouldPersistTaps="always">
						<Card style={styles.cardContainer}>

							<CardItem header style={styles.cardHeader}>
								<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Sign up</Text>
							</CardItem>

							<Form>

								{!!this.state.nameError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='Name'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ nameError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.nameError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>Name</Label>
										<Input
											autoFocus={true}
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(name) => this.setState({ name })}
										/>
									</Item>
								}

								{!!this.state.emailError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='Email'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ emailError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.emailError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>Email</Label>
										<Input
											keyboardType='email-address'
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(email) => this.setState({ email })}
										/>
									</Item>
								}

								{!!this.state.phoneNumberError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='+91 Phone Number'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ phoneNumberError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.phoneNumberError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>+91 Phone number</Label>
										<Input
											keyboardType='number-pad'
											maxLength={10}
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
										/>
									</Item>
								}

								{!!this.state.userNameError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='Choose user name'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ userNameError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.userNameError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>Choose user name</Label>
										<Input
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(userName) => this.setState({ userName })}
										/>
									</Item>
								}

								{!!this.state.passwordError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='Password'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ passwordError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.passwordError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>Password</Label>
										<Input
											secureTextEntry={true}
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(password) => this.setState({ password })}
										/>
									</Item>
								}

								{!!this.state.confirmPasswordError ? (
									<Form>
										<Item style={{ borderColor: 'red', borderWidth: 1 }}>
											<Input
												placeholder='Confirm password'
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ confirmPasswordError: null }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											/>
											<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
										</Item>
										<Text style={styles.errorMsg}>{this.state.confirmPasswordError}</Text>
									</Form>
								) :
									<Item floatingLabel>
										<Label>Confirm password</Label>
										<Input
											secureTextEntry={true}
											onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
											onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
											onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
										/>
									</Item>
								}
								<View style={{ flex: 1, flexDirection: 'row', marginTop: 20 }}>
									<Text style={{ flex: 0.65, marginLeft: 15, marginTop: 10, color: '#9E9E9E' }}>Verification : </Text>

									{this._verficationButton()}
								</View>

								<TouchableOpacity onPress={() => this._onPressButton()}>
									<View style={styles.buttonSignUp}>
										<Text style={styles.buttonTextSignUp}>SIGN UP</Text>
									</View>
								</TouchableOpacity>


							</Form>
						</Card>
					</ScrollView>
				</View>
			</View>
		)
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	signUpViewContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingTop: 5
	},
	cardContainer: {
		padding: 15,
		marginTop: 20,
		marginLeft: 30,
		marginRight: 30
	},
	cardHeader: {
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0'
	},
	inputContainer: {
		height: 100,
		marginBottom: 15,
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	inputs: {
		height: 45,
		marginLeft: 5,
		borderBottomWidth: 1,
		flex: 1,
	},
	buttonSignUp: {
		marginTop: 10,
		alignItems: 'center',
		backgroundColor: '#0000FF',
		borderRadius: 5
	},
	buttonTextSignUp: {
		padding: 10,
		color: 'white',
	},
	buttonOTP: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#33B5E5',
		borderBottomLeftRadius: 10,
		borderTopLeftRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextOTP: {

		paddingLeft: 5,
		color: 'white',
		fontSize: 12,
	},
	buttonEmail: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#33B5E5',
		borderBottomRightRadius: 10,
		borderTopRightRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextEmail: {
		padding: 2,
		color: '#FFFFFF',
		fontSize: 12,
	},
	buttonEmailOff: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderBottomRightRadius: 10,
		borderTopRightRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextEmailOff: {
		padding: 2,
		color: '#33B5E5',
		fontSize: 12,

	},

	buttonOTPOff: {
		flex: 1,
		flexDirection: 'row',
		padding: 8,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderBottomLeftRadius: 10,
		borderTopLeftRadius: 10,
		borderWidth: 0.7,
		borderColor: '#33B5E5',
	},
	buttonTextOTPOff: {
		fontSize: 12,
		padding: 2,
		color: '#33B5E5',
	},

	errorMsg: {
		marginLeft: 18,
		fontSize: 12,
		color: 'red'
	}
})







// import React, { Component } from 'react';
// import { StatusBar, BackHandler, Platform, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Header, Left, Body, Content, Card, CardItem, Text, Title, Item, Label, Input, Icon, Form } from 'native-base';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// import Loader from '../../Utilities/Loader';
// import * as utilities from '../../Utilities/utilities';
// import CircleCheckBox, { LABEL_POSITION } from 'react-native-circle-checkbox';
// import { Col, Grid } from "react-native-easy-grid";
// import { Dropdown } from 'react-native-material-dropdown';
// import { URL, APIKEY } from '../../../App';

// var _ = require('lodash');

// export default class VerifierSignupScreen extends Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			isConnected: true,
// 			name: '',
// 			email: '',
// 			phoneNumber: '',
// 			borderBottomColorPassword: '#757575',
// 			borderBottomColorUserName: '#757575',
// 			loading: false,
// 			loaderText: 'Signing you up...',
// 			nameError: null,
// 			emailError: null,
// 			phoneNumberError: null,
// 			userNameError: null,
// 			btnOTP: 'active',
// 			btnEmail: 'inactive',
// 			employer: true,
// 			thirdPartyAgency: false,
// 			student: false,
// 			employer_reg_no: '',
// 			employer_reg_noError: "",
// 			addressError: '',
// 			address: '',
// 			workingSector: '',
// 			agencyName: '',
// 			agencyNameError: '',
// 			agency_reg_no: '',
// 			agency_reg_noError: "",
// 			agencyWorkingSector: '',
// 			agencyWorkingSectorError: '',
// 			agencyAddress: '',
// 			agencyAddressError: '',
// 			agencyMobileNo: '',
// 			agencyMobileNoError: '',
// 			agencyEmailId: '',
// 			agencyEmailIdError: '',
// 			studentFirstName: '',
// 			studentFirstNameError: '',
// 			studentLastName: '',
// 			studentLastNameError: '',
// 			institute: '',
// 			instituteList: [],
// 			instituteError: '',
// 			degree: '',
// 			degreeList: [],
// 			degreeError: '',
// 			branchList: [],
// 			branch: '',
// 			branchError: '',
// 			passoutYear: '',
// 			passoutYearList: [],
// 			passoutYearError: '',
// 			studentRegNo: '',
// 			studentRegNoError: '',
// 			studentMobileNo: '',
// 			studentMobileNoError: '',
// 			studentEmailId: '',
// 			studentEmailIdError: '',
// 			studentAddress: '',
// 			studentAddressError: '',
// 			degreeID: '',
// 			bracnhID: ''
// 		};
// 	}
// 	componentDidMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackPress), this.degreeApi(), this.instituteApi(), this.getYearsList() }
// 	componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress) }
// 	handleBackPress = () => { this.props.navigation.navigate('VerifierLoginScreen'); return true; }
// 	getYearsList = () => {
// 		var currentYear = new Date().getFullYear(),
// 			startYear = 2000;
// 		for (var i = startYear; i <= currentYear; i++) {
// 			var obj = {}
// 			obj.value = i
// 			this.state.passoutYearList.push(obj)
// 		}
// 	}
// 	_validateEmail() {
// 		let lEmail = this.state.email;
// 		let res = utilities.checkEmail(lEmail);
// 		if (!res) { this.setState({ emailError: "This email address is invalid" }); }
// 		return res;
// 	}
// 	_validateMobileNumber() {
// 		let lPhoneNumber = this.state.phoneNumber;
// 		let res = '';
// 		res = utilities.checkMobileNumber(lPhoneNumber);
// 		if (!res || lPhoneNumber.trim().length < 10) { this.setState({ phoneNumberError: "This phone number appears to be invalid." }); }
// 		return res;
// 	}
// 	_validateEmail1() {
// 		let lEmail = this.state.agencyEmailId;
// 		let res = utilities.checkEmail(lEmail);
// 		if (!res) { this.setState({ agencyEmailIdError: "This email address is invalid" }); }
// 		return res;
// 	}
// 	_validateMobileNumber1() {
// 		let lPhoneNumber = this.state.agencyMobileNo;
// 		let res = '';
// 		res = utilities.checkMobileNumber(lPhoneNumber);
// 		if (!res || lPhoneNumber.trim().length < 10) { this.setState({ agencyMobileNoError: "This phone number appears to be invalid." }); }
// 		return res;
// 	}
// 	_validateEmail2() {
// 		let lEmail = this.state.studentEmailId;
// 		let res = utilities.checkEmail(lEmail);
// 		if (!res) { this.setState({ studentEmailIdError: "This email address is invalid" }); }
// 		return res;
// 	}
// 	_validateMobileNumber2() {
// 		let lPhoneNumber = this.state.studentMobileNo;
// 		let res = '';
// 		res = utilities.checkMobileNumber(lPhoneNumber);
// 		if (!res || lPhoneNumber.trim().length < 10) { this.setState({ studentMobileNoError: "This phone number appears to be invalid." }); }
// 		return res;
// 	}
// 	instituteApi = () => {
// 		console.log("===========fdsfkdsdfdgs")
// 		this.setState({ loading: true })
// 		const formData = new FormData();
// 		formData.append('type', 'institute');
// 		fetch(`${URL}dropdown`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'multipart\/form-data',
// 				'apikey': APIKEY,
// 			},
// 			body: formData,
// 		}).then(res => res.json())
// 			.then(response => {
// 				this.setState({ loading: false })
// 				console.log('=======response',response);
// 				if (response.status == 200) {
// 					this.setState({ instituteList: response.data })
// 				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 422) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 400) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
// 				else if (response.status == 405) { utilities.showToastMsg(response.message); }
// 			})
// 			.catch(error => {
// 				this.setState({ loading: false })
// 				console.log("=======error instituteApi",error);
// 			});
// 	}
// 	degreeApi = () => {
// 		this.setState({ loading: true })
// 		const formData = new FormData();
// 		formData.append('type', 'degree');
// 		fetch(`${URL}dropdown`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'multipart\/form-data',
// 				'apikey': APIKEY,
// 			},
// 			body: formData,
// 		}).then(res => res.json())
// 			.then(response => {
// 				this.setState({ loading: false })
// 				console.log(response);
// 				if (response.status == 200) {
// 					this.setState({ degreeList: response.data })
// 				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 422) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 400) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
// 				else if (response.status == 405) { utilities.showToastMsg(response.message); }
// 			})
// 			.catch(error => {
// 				this.setState({ loading: false })
// 				console.log("=======error degreeApi",error);
// 			});
// 	}
// 	branchesApi = (degreeID) => {
// 		this.setState({ loading: true })
// 		const formData = new FormData();
// 		formData.append('type', 'branch');
// 		formData.append('degree_id', degreeID);

// 		fetch(`${URL}dropdown`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'multipart\/form-data',
// 				'apikey': APIKEY,
// 			},
// 			body: formData,
// 		}).then(res => res.json())
// 			.then(response => {
// 				this.setState({ loading: false })
// 				console.log(response);
// 				if (response.status == 200) {
// 					this.setState({ branchList: response.data })
// 					this.setState(this.state);
// 				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 422) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 400) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
// 				else if (response.status == 405) { utilities.showToastMsg(response.message); }
// 			})
// 			.catch(error => {
// 				this.setState({ loading: false })
// 				console.log("=======error branchesApi",error);
// 			});
// 	}
// 	_onPressButton(condition) {
// 		console.log(this.state);
// 		if (condition === "Emp") {
// 			this.setState({
// 				agencyNameError: '',
// 				agencyEmailIdError: '',
// 				agencyMobileNoError: '',
// 				agency_reg_noError: '',
// 				agencyAddressError: '',
// 				studentFirstNameError: '',
// 				studentLastNameError: '',
// 				studentEmailIdError: '',
// 				studentMobileNoError: '',
// 				studentRegNoError: '',
// 				studentAddressError: ''
// 			})
// 			if (this.state.name === "") {
// 				this.setState({ nameError: "Name is required." });
// 				return;
// 			} else {
// 				this.setState({ nameError: null });
// 			}
// 			if (this.state.email === "") {
// 				this.setState({ emailError: "Email is required." });
// 				return;
// 			} else {
// 				this.setState({ emailError: null });
// 			}
// 			if (this.state.phoneNumber === "") {
// 				this.setState({ phoneNumberError: "Phone number is required." });
// 				return;
// 			} else {
// 				this.setState({ phoneNumberError: null });
// 			}
// 			if (this.state.employer_reg_no === "") {
// 				this.setState({ employer_reg_noError: "Registration No is required." });
// 				return;
// 			} else {
// 				this.setState({ employer_reg_noError: null });
// 			}
// 			if (this.state.workingSector === "") {
// 				utilities.showToastMsg("Working Sector is required.")
// 				return;
// 			} if (this.state.address === "") {
// 				this.setState({ addressError: "Address is required." });
// 				return;
// 			} else {
// 				this.setState({ addressError: null });
// 			} if (this._validateEmail(this.state.email) && this._validateMobileNumber(this.state.phoneNumber)) {
// 				const formData = new FormData();
// 				formData.append('type', 'register');
// 				formData.append('registration_type', '1');
// 				formData.append('employer_name', this.state.name);
// 				formData.append('employer_reg_no', this.state.employer_reg_no);
// 				formData.append('employer_working_sector', this.state.workingSector);
// 				formData.append('employer_address', this.state.address);
// 				formData.append('employer_mob_no', this.state.phoneNumber);
// 				formData.append('employer_email', this.state.email);

// 				this.callTheRegisterApi(formData);
// 			}
// 		}
// 		else if (condition === "ThirdParty") {
// 			this.setState({
// 				nameError: '',
// 				emailError: '',
// 				phoneNumberError: '',
// 				employer_reg_noError: '',
// 				addressError: '',
// 				studentFirstNameError: '',
// 				studentLastNameError: '',
// 				studentEmailIdError: '',
// 				studentMobileNoError: '',
// 				studentRegNoError: '',
// 				studentAddressError: ''
// 			})
// 			if (this.state.agencyName === "") {
// 				this.setState({ agencyNameError: "Agency Name is required." });
// 				return;
// 			} else {
// 				this.setState({ agencyNameError: null });
// 			}
// 			if (this.state.agencyEmailId === "") {
// 				this.setState({ agencyEmailIdError: "Email is required." });
// 				return;
// 			} else {
// 				this.setState({ agencyEmailIdError: null });
// 			}
// 			if (this.state.agencyMobileNo === "") {
// 				this.setState({ agencyMobileNoError: "Phone number is required." });
// 				return;
// 			} else {
// 				this.setState({ agencyMobileNoError: null });
// 			}
// 			if (this.state.agency_reg_no === "") {
// 				this.setState({ agency_reg_noError: "Registration No is required." });
// 				return;
// 			} else {
// 				this.setState({ agency_reg_noError: null });
// 			}
// 			if (this.state.agencyWorkingSector === "") {
// 				utilities.showToastMsg("Working Sector is required.")
// 				return;
// 			}
// 			if (this.state.agencyAddress === "") {
// 				this.setState({ agencyAddressError: "Address is required." });
// 				return;
// 			} else {
// 				this.setState({ agencyAddressError: null });
// 			} if (this._validateEmail1(this.state.agencyEmailId) && this._validateMobileNumber1(this.state.agencyMobileNo)) {
// 				const formData = new FormData();
// 				formData.append('type', 'register');
// 				formData.append('registration_type', '2');
// 				formData.append('agency_name', this.state.agencyName);
// 				formData.append('agency_reg_no', this.state.agency_reg_no);
// 				formData.append('agency_working_sector', this.state.agencyWorkingSector);
// 				formData.append('agency_address', this.state.agencyAddress);
// 				formData.append('agency_mob_no', this.state.agencyMobileNo);
// 				formData.append('agency_email', this.state.agencyEmailId);
// 				this.callTheRegisterApi(formData);
// 			}
// 		}
// 		else if (condition === "Std") {
// 			this.setState({
// 				agencyNameError: '',
// 				agencyEmailIdError: '',
// 				agencyMobileNoError: '',
// 				agency_reg_noError: '',
// 				agencyAddressError: '',
// 				nameError: '',
// 				emailError: '',
// 				phoneNumberError: '',
// 				employer_reg_noError: '',
// 				addressError: ''
// 			})
// 			if (this.state.studentFirstName === "") {
// 				this.setState({ studentFirstNameError: "First Name is required." });
// 				return;
// 			} else {
// 				this.setState({ studentFirstNameError: null });
// 			}
// 			if (this.state.studentLastName === "") {
// 				this.setState({ studentLastNameError: "Last Name is required." });
// 				return;
// 			} else {
// 				this.setState({ studentLastNameError: null });
// 			}
// 			if (this.state.studentEmailId === "") {
// 				this.setState({ studentEmailIdError: "Email is required." });
// 				return;
// 			} else {
// 				this.setState({ studentEmailIdError: null });
// 			}
// 			if (this.state.studentMobileNo === "") {
// 				this.setState({ studentMobileNoError: "Phone number is required." });
// 				return;
// 			} else {
// 				this.setState({ studentMobileNoError: null });
// 			}
// 			if (this.state.studentRegNo === "") {
// 				this.setState({ studentRegNoError: "Registration No is required." });
// 				return;
// 			} else {
// 				this.setState({ studentRegNoError: null });
// 			}
// 			if (this.state.studentRegNo.length <= 10) {
// 				this.setState({ studentRegNoError: "Registration No length should be more than 10 characters." });
// 				return;
// 			} else {
// 				this.setState({ studentRegNoError: null });
// 			}
// 			if (this.state.institute === "") {
// 				utilities.showToastMsg("Institute is required.")
// 				return;
// 			}
// 			if (this.state.degree === "") {
// 				utilities.showToastMsg("Degree is required.")
// 				return;
// 			}
// 			if (this.state.branch === "") {
// 				utilities.showToastMsg("Branch is required.")
// 				return;
// 			}
// 			if (this.state.passoutYear === "") {
// 				utilities.showToastMsg("Passout Year is required.")
// 				return;
// 			}
// 			if (this.state.studentAddress === "") {
// 				this.setState({ studentAddressError: "Address is required." });
// 				return;
// 			} else {
// 				this.setState({ studentAddressError: null });
// 			}

// 			if (this._validateEmail2(this.state.studentEmailId) && this._validateMobileNumber2(this.state.studentMobileNo)) {
// 				const formData = new FormData();
// 				formData.append('type', 'register');
// 				formData.append('registration_type', '0');
// 				formData.append('student_f_name', this.state.studentFirstName);
// 				formData.append('student_l_name', this.state.studentLastName);
// 				formData.append('student_institute', this.state.institute);
// 				formData.append('student_degree', this.state.degreeID);
// 				formData.append('student_branch', this.state.bracnhID);
// 				formData.append('passout_year', this.state.passoutYear);
// 				formData.append('student_reg_no', this.state.studentRegNo);
// 				formData.append('student_mob_no', this.state.studentMobileNo);
// 				formData.append('student_email', this.state.studentEmailId);
// 				this.callTheRegisterApi(formData);
// 			}
// 		}
// 	}
// 	callTheRegisterApi = (formData) => {
// 		console.log("oo");

// 		console.log(formData);

// 		this.setState({ loading: true })
// 		fetch(`${URL}registration`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'multipart\/form-data',
// 				'Accept': 'application/json',
// 				'apikey': APIKEY,
// 			},
// 			body: formData,
// 		}).then(res => res.json())
// 			.then(response => {
// 				this.setState({ loading: false })
// 				console.log("==-=-=-=-=-=-=");

// 				console.log(response);
// 				if (response.status == 200) {
// 					if (response.otp) {
// 						AsyncStorage.setItem('OTPDATA', response.otp+"")
// 						if (this.state.phoneNumber) {
// 							AsyncStorage.setItem('MOBILENO', this.state.phoneNumber)
// 						} else if (this.state.agencyMobileNo) {
// 							AsyncStorage.setItem('MOBILENO', this.state.agencyMobileNo)
// 						} else if (this.state.studentMobileNo) {
// 							AsyncStorage.setItem('MOBILENO', this.state.studentMobileNo)
// 						}
// 					}
// 					utilities.showToastMsg(response.message);
// 					this.props.navigation.navigate('OTPVerification');
// 				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 422) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 400) { utilities.showToastMsg(response.message); }
// 				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
// 				else if (response.status == 405) { utilities.showToastMsg(response.message); }
// 			})
// 			.catch(error => {
// 				this.setState({ loading: false })
// 				console.log("registration error---",error);
// 			});
// 	}
// 	_showHeader() {
// 		if (Platform.OS == 'ios') {
// 			return (
// 				<Header style={{ backgroundColor: '#0000FF' }}>
// 					<Grid>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierLoginScreen')}>
// 								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
// 							</TouchableOpacity>
// 						</Col>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Demo SeQR Scan</Title>
// 						</Col>
// 						<Col></Col>
// 					</Grid>
// 				</Header>
// 			)
// 		} else {
// 			return (
// 				<Header style={{ backgroundColor: '#0000FF' }}>
// 					<Grid>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierLoginScreen')}>
// 								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
// 							</TouchableOpacity>
// 						</Col>
// 						<Col style={{ justifyContent: 'center' }}>
// 							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Demo SeQR Scan</Title>
// 						</Col>
// 						<Col></Col>
// 					</Grid>
// 				</Header>
// 			)
// 		}
// 	}
// 	selectDegreeID = (degree, listOfDegrees) => {
// 		if (degree) {
// 			this.setState({ degree: degree, branchList: [] })
// 			let idForDegree = _.filter(listOfDegrees, { value: degree })[0].id
// 			this.setState({ degreeID: idForDegree })
// 			this.branchesApi(idForDegree)
// 		}
// 	}
// 	settingBranch = (branch, listOfBranches) => {
// 		let idForBranch = _.filter(listOfBranches, { value: branch })[0].id
// 		this.setState({ branch: branch, bracnhID: idForBranch })
// 	}
// 	setYear = (yr) => {
// 		console.log(yr);
// 		this.setState({ passoutYear: yr })
// 	}
// 	render() {
// 		const workingData = [{
// 			value: 'Public sector',
// 		}, {
// 			value: 'Private sector',
// 		}, {
// 			value: 'Government Body',
// 		}, {
// 			value: 'Public Sector Unit',
// 		}];
// 		return (
// 			<View style={styles.container}>

// 				{this._showHeader()}
// 				<StatusBar backgroundColor="#0000FF" />

// 				<Loader
// 					loading={this.state.loading}
// 					text={this.state.loaderText}
// 				/>

// 				<View style={styles.signUpViewContainer}>
// 					<ScrollView keyboardShouldPersistTaps="always">
// 						<Card style={styles.cardContainer}>

// 							<CardItem header style={styles.cardHeader}>
// 								<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Sign up</Text>
// 							</CardItem>

// 							<Content>
// 								<Form>
// 									{/* <Grid >
// 										<Col style={{ justifyContent: 'center' }} size={4}>
// 											<CircleCheckBox
// 												checked={this.state.employer}
// 												onToggle={(checked) => this.setState({ employer: checked ? true : true, thirdPartyAgency: false, student: false })}
// 												labelPosition={LABEL_POSITION.RIGHT}
// 												label="Employer"
// 												styleCheckboxContainer={{ marginTop: 10 }}
// 											/>
// 										</Col>
// 										<Col style={{ justifyContent: 'center' }} size={4}>
// 											<CircleCheckBox
// 												checked={this.state.thirdPartyAgency}
// 												onToggle={(checked) => this.setState({ thirdPartyAgency: checked ? true : true, employer: false, student: false })}
// 												labelPosition={LABEL_POSITION.RIGHT}
// 												label="Third Party Agency"
// 												styleCheckboxContainer={{ marginTop: 10 }}
// 											/>
// 										</Col>
// 										<Col style={{ justifyContent: 'center', }} size={4}>
// 											<CircleCheckBox
// 												checked={this.state.student}
// 												onToggle={(checked) => this.setState({ student: checked ? true : true, employer: false, thirdPartyAgency: false })}
// 												labelPosition={LABEL_POSITION.RIGHT}
// 												label="Student"
// 												styleCheckboxContainer={{ marginTop: 10 }}
// 											/>
// 										</Col>
// 									</Grid> */}

// 									{this.state.employer ?
// 										<View>
// 											<View>
// 												<Grid>
// 													<Col style={{ justifyContent: 'center' }} size={3}>
// 														<CircleCheckBox
// 															checked={this.state.employer}
// 															onToggle={(checked) => this.setState({ employer: checked ? true : true, thirdPartyAgency: false, student: false })}
// 															labelPosition={LABEL_POSITION.RIGHT}
// 															label="Employer"
// 															styleCheckboxContainer={{ marginTop: 10 }}
// 														/>
// 													</Col>
// 													<Col style={{ justifyContent: 'center' }} size={3}>
// 														<CircleCheckBox
// 															checked={this.state.thirdPartyAgency}
// 															onToggle={(checked) => this.setState({ thirdPartyAgency: checked ? true : true, employer: false, student: false })}
// 															labelPosition={LABEL_POSITION.RIGHT}
// 															label="Third Party Agency"
// 															styleCheckboxContainer={{ marginTop: 10 }}
// 														/>
// 													</Col>
// 													<Col style={{ justifyContent: 'center', }} size={3}>
// 														<CircleCheckBox
// 															checked={this.state.student}
// 															onToggle={(checked) => this.setState({ student: checked ? true : true, employer: false, thirdPartyAgency: false })}
// 															labelPosition={LABEL_POSITION.RIGHT}
// 															label="Student"
// 															styleCheckboxContainer={{ marginTop: 10 }}
// 														/>
// 													</Col>
// 												</Grid>
// 											</View>
// 											{!!this.state.nameError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Name'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ nameError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.nameError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Employer Name</Label>
// 													<Input
// 														autoFocus={true}
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(name) => this.setState({ name })}
// 													/>
// 												</Item>
// 											}

// 											{!!this.state.emailError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Email'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ emailError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.emailError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Email</Label>
// 													<Input
// 														keyboardType='email-address'
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(email) => this.setState({ email })}
// 													/>
// 												</Item>
// 											}

// 											{!!this.state.phoneNumberError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='+91 Phone Number'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ phoneNumberError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.phoneNumberError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>+91 Phone number</Label>
// 													<Input
// 														keyboardType='number-pad'
// 														maxLength={10}
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
// 													/>
// 												</Item>
// 											}

// 											{!!this.state.employer_reg_noError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Employer CIN/Registration No'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ employer_reg_noError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.employer_reg_noError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Employer CIN/Registration No</Label>
// 													<Input
// 														maxLength={25}
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(employer_reg_no) => this.setState({ employer_reg_no })}
// 													/>
// 												</Item>
// 											}

// 											{/* <View style={{ flex: 1, flexDirection: 'row', marginTop: 20 }}>
// 												<Text style={{ flex: 0.65, marginLeft: 15, marginTop: 10, color: '#9E9E9E' }}>Verification : </Text>

// 												{this._verficationButton()}
// 											</View> */}
// 											<View style={{ margin: 10 }}>
// 												<Dropdown
// 													label='Working Sector'
// 													data={workingData}
// 													onChangeText={(workingSector) => this.setState({ workingSector: workingSector })}
// 												/>
// 											</View>
// 											{!!this.state.addressError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Address'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ addressError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.addressError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Address</Label>
// 													<Input
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(address) => this.setState({ address })}
// 													/>
// 												</Item>
// 											}

// 											<Content padder>
// 												<TouchableOpacity onPress={() => this._onPressButton("Emp")}>
// 													<View style={styles.buttonSignUp}>
// 														<Text style={styles.buttonTextSignUp}>SIGN UP</Text>
// 													</View>
// 												</TouchableOpacity>

// 											</Content>
// 										</View>
// 										: <View></View>}

// 									{this.state.thirdPartyAgency ?
// 										<View>
// 											<Grid >
// 												<Col style={{ justifyContent: 'center' }} size={3}>
// 													<CircleCheckBox
// 														checked={this.state.employer}
// 														onToggle={(checked) => this.setState({ employer: checked ? true : true, thirdPartyAgency: false, student: false })}
// 														labelPosition={LABEL_POSITION.RIGHT}
// 														label="Employer"
// 														styleCheckboxContainer={{ marginTop: 10 }}
// 													/>
// 												</Col>
// 												<Col style={{ justifyContent: 'center' }} size={3}>
// 													<CircleCheckBox
// 														checked={this.state.thirdPartyAgency}
// 														onToggle={(checked) => this.setState({ thirdPartyAgency: checked ? true : true, employer: false, student: false })}
// 														labelPosition={LABEL_POSITION.RIGHT}
// 														label="Third Party Agency"
// 														styleCheckboxContainer={{ marginTop: 10 }}
// 													/>
// 												</Col>
// 												<Col style={{ justifyContent: 'center', }} size={3}>
// 													<CircleCheckBox
// 														checked={this.state.student}
// 														onToggle={(checked) => this.setState({ student: checked ? true : true, employer: false, thirdPartyAgency: false })}
// 														labelPosition={LABEL_POSITION.RIGHT}
// 														label="Student"
// 														styleCheckboxContainer={{ marginTop: 10 }}
// 													/>
// 												</Col>
// 											</Grid>
// 											{!!this.state.agencyNameError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Agency Name'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ agencyNameError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.agencyNameError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Agency Name</Label>
// 													<Input
// 														autoFocus={true}
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(agencyName) => this.setState({ agencyName })}
// 													/>
// 												</Item>
// 											}

// 											{!!this.state.agencyEmailIdError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Email'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ agencyEmailIdError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.agencyEmailIdError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Email</Label>
// 													<Input
// 														keyboardType='email-address'
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(agencyEmailId) => this.setState({ agencyEmailId })}
// 													/>
// 												</Item>
// 											}

// 											{!!this.state.agencyMobileNoError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='+91 Phone Number'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ agencyMobileNoError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.agencyMobileNoError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>+91 Phone number</Label>
// 													<Input
// 														keyboardType='number-pad'
// 														maxLength={10}
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(agencyMobileNo) => this.setState({ agencyMobileNo: agencyMobileNo })}
// 													/>
// 												</Item>
// 											}

// 											{!!this.state.agency_reg_noError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Agency CIN/Registration No'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ agency_reg_noError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.agency_reg_noError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Agency CIN/Registration No</Label>
// 													<Input
// 														maxLength={25}
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(agency_reg_no) => this.setState({ agency_reg_no })}
// 													/>
// 												</Item>
// 											}

// 											<View style={{ margin: 10 }}>
// 												<Dropdown
// 													label='Working Sector'
// 													data={workingData}
// 													onChangeText={(workingSector) => this.setState({ agencyWorkingSector: workingSector })}
// 												/>
// 											</View>
// 											{!!this.state.agencyAddressError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Address'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ agencyAddressError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.agencyAddressError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Address</Label>
// 													<Input
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(agencyAddress) => this.setState({ agencyAddress })}
// 													/>
// 												</Item>
// 											}

// 											<Content padder>
// 												<TouchableOpacity onPress={() => this._onPressButton("ThirdParty")}>
// 													<View style={styles.buttonSignUp}>
// 														<Text style={styles.buttonTextSignUp}>SIGN UP</Text>
// 													</View>
// 												</TouchableOpacity>

// 											</Content>
// 										</View>

// 										: <View></View>}

// 									{this.state.student ?
// 										<View style={{ marginTop: 0, paddingTop: 0 }}>
// 											<Grid >
// 												<Col style={{ justifyContent: 'center' }} size={4}>
// 													<CircleCheckBox
// 														checked={this.state.employer}
// 														onToggle={(checked) => this.setState({ employer: checked ? true : true, thirdPartyAgency: false, student: false })}
// 														labelPosition={LABEL_POSITION.RIGHT}
// 														label="Employer"
// 														styleCheckboxContainer={{ marginTop: 10 }}
// 													/>
// 												</Col>
// 												<Col style={{ justifyContent: 'center' }} size={4}>
// 													<CircleCheckBox
// 														checked={this.state.thirdPartyAgency}
// 														onToggle={(checked) => this.setState({ thirdPartyAgency: checked ? true : true, employer: false, student: false })}
// 														labelPosition={LABEL_POSITION.RIGHT}
// 														label="Third Party Agency"
// 														styleCheckboxContainer={{ marginTop: 10 }}
// 													/>
// 												</Col>
// 												<Col style={{ justifyContent: 'center', }} size={3}>
// 													<CircleCheckBox
// 														checked={this.state.student}
// 														onToggle={(checked) => this.setState({ student: checked ? true : true, employer: false, thirdPartyAgency: false })}
// 														labelPosition={LABEL_POSITION.RIGHT}
// 														label="Student"
// 														styleCheckboxContainer={{ marginTop: 10 }}
// 													/>
// 												</Col>
// 											</Grid>
// 											{!!this.state.studentFirstNameError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='First Name'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentFirstNameError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.studentFirstNameError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>First Name</Label>
// 													<Input
// 														autoFocus={true}
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(studentFirstName) => this.setState({ studentFirstName })}
// 													/>
// 												</Item>
// 											}

// 											{!!this.state.studentLastNameError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Last Name'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentLastNameError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.studentLastNameError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Last Name</Label>
// 													<Input
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(studentLastName) => this.setState({ studentLastName })}
// 													/>
// 												</Item>
// 											}

// 											{!!this.state.studentEmailIdError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Email'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentEmailIdError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.studentEmailIdError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Email</Label>
// 													<Input
// 														keyboardType='email-address'
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(studentEmailId) => this.setState({ studentEmailId })}
// 													/>
// 												</Item>
// 											}

// 											{!!this.state.studentMobileNoError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='+91 Phone Number'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentMobileNoError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.studentMobileNoError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>+91 Phone number</Label>
// 													<Input
// 														keyboardType='number-pad'
// 														maxLength={10}
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(studentMobileNo) => this.setState({ studentMobileNo: studentMobileNo })}
// 													/>
// 												</Item>
// 											}

// 											{!!this.state.studentRegNoError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Student Institute Registration Number / Enrollment Number'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentRegNoError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.studentRegNoError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Student Institute Registration Number / Enrollment Number</Label>
// 													<Input
// 														maxLength={20}
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(studentRegNo) => this.setState({ studentRegNo })}
// 														style={{ marginTop: 30 }}
// 													/>
// 												</Item>
// 											}
// 											<View style={{ marginLeft: 10, marginRight: 10 }}>
// 												<Dropdown
// 													label='Institute'
// 													data={this.state.instituteList}
// 													onChangeText={(institute) => this.setState({ institute: institute })}
// 												/>
// 											</View>
// 											<View style={{ marginLeft: 10, marginRight: 10 }}>
// 												<Dropdown
// 													label='Degree'
// 													data={this.state.degreeList}
// 													onChangeText={(degree) => this.selectDegreeID(degree, this.state.degreeList)}
// 												/>
// 											</View>
// 											<View style={{ marginLeft: 10, marginRight: 10 }}>
// 												<Dropdown
// 													label='Branch'
// 													data={this.state.branchList.length > 0 ? this.state.branchList : []}
// 													onChangeText={(branch) => this.settingBranch(branch, this.state.branchList)}
// 												/>
// 											</View>

// 											<View style={{ marginLeft: 10, marginRight: 10 }}>
// 												<Dropdown
// 													label='Passout Year'
// 													data={this.state.passoutYearList.length > 0 ? this.state.passoutYearList : []}
// 													onChangeText={(passoutYear) => this.setYear(passoutYear)}
// 												/>
// 											</View>
// 											{!!this.state.studentAddressError ? (
// 												<Form>
// 													<Item style={{ borderColor: 'red', borderWidth: 1 }}>
// 														<Input
// 															placeholder='Address'
// 															onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentAddressError: null }) }}
// 															onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														/>
// 														<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
// 													</Item>
// 													<Text style={styles.errorMsg}>{this.state.studentAddressError}</Text>
// 												</Form>
// 											) :
// 												<Item floatingLabel>
// 													<Label>Address</Label>
// 													<Input
// 														onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
// 														onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
// 														onChangeText={(studentAddress) => this.setState({ studentAddress })}
// 													/>
// 												</Item>
// 											}

// 											<Content padder>
// 												<TouchableOpacity onPress={() => this._onPressButton("Std")}>
// 													<View style={styles.buttonSignUp}>
// 														<Text style={styles.buttonTextSignUp}>SIGN UP</Text>
// 													</View>
// 												</TouchableOpacity>

// 											</Content>
// 										</View>

// 										: <Text></Text>}
// 								</Form>
// 							</Content>
// 						</Card>
// 					</ScrollView>
// 				</View>
// 			</View >
// 		)
// 	}
// };
// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
// 	},
// 	signUpViewContainer: {
// 		flex: 1,
// 		flexDirection: 'column',
// 		alignItems: 'stretch',
// 		paddingTop: 5
// 	},
// 	cardContainer: {
// 		padding: 15,
// 		marginTop: 20,
// 		marginLeft: 20,
// 		marginRight: 20
// 	},
// 	cardHeader: {
// 		borderBottomWidth: 1,
// 		borderBottomColor: '#E0E0E0'
// 	},
// 	buttonSignUp: {
// 		marginTop: 10,
// 		alignItems: 'center',
// 		backgroundColor: '#94302C',
// 		borderRadius: 5
// 	},
// 	buttonTextSignUp: {
// 		padding: 10,
// 		color: '#fcb52f',
// 	},
// 	errorMsg: {
// 		marginLeft: 18,
// 		fontSize: 12,
// 		color: 'red'
// 	}
// })