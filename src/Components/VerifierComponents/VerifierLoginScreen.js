import React, { Component } from 'react';
import { StatusBar, BackHandler, Dimensions, Platform, TextInput, StyleSheet, View, TouchableOpacity, Image, Button, ScrollView,  } from 'react-native';
import { Header, Left, Body, Content, Card, CardItem, Text, Title, Icon, Toast, Form, Item, Input,Label, Right } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Loader from '../../Utilities/Loader';
import * as utilities from '../../Utilities/utilities';
import { URL, APIKEY } from '../../../App';
import { connect } from 'react-redux';
import { setVerifierUserData, changeNameForInstitute } from '../../Redux/Actions/VerifierActions';
import { bindActionCreators } from 'redux';
import { Col, Grid } from "react-native-easy-grid";
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Dropdown } from 'react-native-material-dropdown';

class VerifierLoginScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isConnected: true,
			// username: 'khushboojchoudhari@gmail.com',
			// password: 'admin@123',
			// username: 'khushboojchoudhari@gmail.com',
            // password: 'V7SS3ATF',
			username:'',
			password:'',
			userNameError: '',
			passwordError: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Loading...',
			email_id: '',
			modalVisible: false,
			accessToken: '',
			showHidePW: true,
			collegeName: '',
			instituteList: [],
			isModalVisible: false,
			isForgot: false,
		};
	}

	toggleModal = () => {
		this.setState({ isModalVisible: !this.state.isModalVisible });
	};

	instituteApi = () => {
		this.setState({ loading: true })
		const formData = new FormData();
		formData.append('type', 'institute');
		fetch(`${URL}dropdown`, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart\/form-data',
				'apikey': APIKEY,
			},
			body: formData,
		}).then(res => res.json())
			.then(response => {
				this.setState({ loading: false })
				console.log(response);
				if (response.status == 200) {
					this.setState({ instituteList: response.data })
				} else if (response.status == 409) { utilities.showToastMsg(response.message); }
				else if (response.status == 422) { utilities.showToastMsg(response.message); }
				else if (response.status == 400) { utilities.showToastMsg(response.message); }
				else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('StudentLoginScreen') }
				else if (response.status == 405) { utilities.showToastMsg(response.message); }
			})
			.catch(error => {
				this.setState({ loading: false })
				console.log(error);
			});
	}
	componentDidMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackPress); }
	componentWillUnmount() { 
		// this.setState({isModalVisible: false,
		// 	isForgot: false,});
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress) }
	handleBackPress = () => { this.props.navigation.navigate('HomeScreen'); return true; }
	setModalVisible(visible) { this.setState({ modalVisible: visible }); 
	console.log("Modal")}
	showToastMsg = (msg) => {
		Toast.show({
			text: msg,
			style: { position: 'absolute', bottom: 10, left: 10, right: 10, borderRadius: 5, margin: 20 }
		});
	}
	forgotPasswordApi = () => {
		this.setState({ loading: true })
		console.log("clicked===");
		if (!this.state.email_id) {
			this.setState({ loading: false })
			utilities.showToastMsg('Email cannot be empty.')
			return;
		} else if (utilities.checkEmail(this.state.email_id)) {
			this.setState({ email_idError: '' })
			const formData = new FormData();
			formData.append('type', 'forgotPassword');
			formData.append('email_id', this.state.email_id);
			formData.append('user_type', 1);
			console.log(formData);
			fetch(`http://demo.seqrdoc.com/api/passwordReset`, {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart\/form-data',
					'Accept': 'application/json',
					'apikey': APIKEY,
				},
				body: formData,
			}).then(res => res.json())
				.then(response => {
					this.setState({ loading: false })
					console.log(response);
					if (response.status == 200) {
						this.toggleModal();
						this.setState({modalVisible: false});
						utilities.showToastMsg(response.message);
						this.props.navigation.navigate('VerifierLoginScreen');
					} else if (response.status == 409) { utilities.showToastMsg(response.message); }
					else if (response.status == 422) { utilities.showToastMsg(response.message); }
					else if (response.status == 400) { utilities.showToastMsg(response.message); }
					else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
					else if (response.status == 405) { utilities.showToastMsg(response.message); }
					else if (response.status == 500) { utilities.showToastMsg(response.message); }
				})
				.catch(error => {
					this.setState({ loading: false })
					console.log(error);
				});
		} else {
			this.setState({ loading: false })
			this.setState({ email_idError: 'Email is not proper.' })
		}
	}
	async callForAPI() {
		if (!this.state.username) {
			this.setState({ userNameError: 'Username cannot be empty.' })
			return;
		} else if (!this.state.password) {
			this.setState({ passwordError: 'Password cannot be empty.' })
			return;
		}
		this.setState({ loading: true });
		const formData = new FormData();
		AsyncStorage.setItem('username', this.state.username)
		AsyncStorage.setItem('password', this.state.password)
		formData.append('type', 'login');
		formData.append('username', this.state.username);
		formData.append('password', this.state.password);
		formData.append('user_type', 1);
		console.log(formData);
		fetch(`${URL}user-login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart\/form-data',
				'apikey': APIKEY,
			},
			body: formData,
		}).then(res => {
			res.json().then(async response => {
				console.log(res.headers.map.accesstoken);
				this.setState({ loading: false, accessToken: res.headers.map.accesstoken })
				console.log("--");

				console.log("Verifier response:",response);
				if (response.status == 200) {
					var response = response.data;
					// console.log(JSON.stringify(response,null,2));
					await AsyncStorage.setItem('USERDATA', JSON.stringify(response));
					console.log('======== verifier' , JSON.stringify(response,null,2))
					AsyncStorage.setItem('accessToken', this.state.accessToken)
					response.accessToken = this.state.accessToken

					this.props.setVerifierData(response)
					this.props.changeNameForInstitute(this.state.collegeName)
					this.props.navigation.navigate('VerifierMainScreen')
				} else if (response.status == 409) {
					this.showToastMsg(response.message);
				} else if (response.status == 422) {
					this.showToastMsg(response.message);
					return;
				} else if (response.status == 400) {
					this.showToastMsg(response.message);
				} else if (response.status == 403) {
					this.showToastMsg(response.message);
					this.props.navigation.navigate('VerifierLoginScreen')
				} else if (response.status == 405) {
					this.showToastMsg(response.message);
				} else if (response.status == 402) {
					this.showToastMsg(response.message);
				}
			})
		}).catch(error => {
			this.setState({ loading: false })
			console.log(error);
		});
	}
	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Grid>
						<Col style={{ justifyContent: 'center' }}>
							<TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
							</TouchableOpacity>
						</Col>
						<Col style={{ justifyContent: 'center' }}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Demo SeQR Scan</Title>
						</Col>
						<Col></Col>
					</Grid>
				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Grid>
						<Col style={{ justifyContent: 'center' }}>
							<TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
								<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
							</TouchableOpacity>
						</Col>
						<Col style={{ justifyContent: 'center' }}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Demo SeQR Scan</Title>
						</Col>
						<Col></Col>
					</Grid>
				</Header>
			)
		}
	}
	render() {
		return (
			<View style={styles.container}>
				{this._showHeader()}
				<StatusBar backgroundColor="#0000FF" />
				<Loader loading={this.state.loading} text={this.state.loaderText} />
				<View style={styles.loginViewContainer}>
					<ScrollView keyboardShouldPersistTaps="always">
						<Card style={styles.cardContainer}>
							<CardItem header style={styles.cardHeader}>
								<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Login</Text>
							</CardItem>
							{/* <View>
								<Dropdown
									label='Select College'
									data={this.state.instituteList}
									onChangeText={(collegeName) => this.setState({ collegeName: collegeName })}
								/>
							</View> */}
							<View style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
								<View style={styles.inputContainer}>
									{/* <TextInput style={{ borderBottomColor: this.state.borderBottomColorUserName, ...styles.inputs }}
										placeholder='Username'
										onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
										onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
										onChangeText={(username) => this.setState({ username })}
									/> */}
									{!!this.state.userNameError ? (
										<Form>
											<Item style={{ borderColor: 'red', borderWidth: 1 }}>
												<Input
													placeholder='Username'
													onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ userNameError: null }) }}
													onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												/>
												<Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
											</Item>
											<Text style={styles.errorMsg}>{this.state.userNameError}</Text>
										</Form>
									) :
										<Item floatingLabel>
											<Label style={{ color: 'grey' }}>Username</Label>
											<Input
												autoFocus={true}
												value ={ this.state.username}
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(username) => this.setState({ username })}
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
											<Label style={{ color: 'grey' }}>Password</Label>
											<Input
												secureTextEntry={this.state.showHidePW}
												value={ this.state.password }
												onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
												onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
												onChangeText={(password) => this.setState({ password })}
											/>
											{this.state.showHidePW ?
												<Icon type="FontAwesome" name="eye" style={{ fontSize: 25, color: 'red', paddingLeft: 13 }} onPress={() => this.setState({ showHidePW: false })} />
												:
												<Icon type="FontAwesome" name="eye-slash" style={{ fontSize: 25, color: 'red', paddingLeft: 13 }} onPress={() => this.setState({ showHidePW: true })} />
											}
										</Item>
									}
									{/* <TextInput style={{ borderBottomColor: this.state.borderBottomColorPassword, ...styles.inputs }}
										placeholder='Password'
										secureTextEntry={true}
										onFocus={() => { this.setState({ borderBottomColorPassword: '#50CAD0' }) }}
										onBlur={() => { this.setState({ borderBottomColorPassword: '#757575' }); }}
										onChangeText={(password) => this.setState({ password })} /> */}
								</View>
							</View>

							<View style={{ width: 50 }}>
								{/* <Modal
									animationType="slide"
									transparent={true}
									visible={this.state.modalVisible}
									style={{ backgroundColor: 'red' }}
								>
									<View style={{
										flex: 1,
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'center'
									}} > */}
										{/* <View style={{
											width: 350,
											height: 260,
											backgroundColor: 'white',
											borderRadius: 2,
											borderColor: '#7f2e2a',
											borderWidth: 1
										}}>
											<Grid style={{ flex: 0.7, justifyContent: 'center' }}>
												<Col size={5} style={{ justifyContent: 'center' }}>
													<Text style={{ fontSize: 23, color: '#993300', textAlign: 'center', }}>Reset Password</Text>
												</Col>
												<Col style={{ justifyContent: 'center' }}>
													<TouchableOpacity onPress={() => { this.setModalVisible(false), this.setState({ email_idError: '', email_id: '' }) }}>
														<Icon type="FontAwesome" name="times" style={{ fontSize: 25, color: 'red', paddingLeft: 13 }} />
													</TouchableOpacity>
												</Col>
											</Grid>
											<View style={{ borderBottomWidth: 1, borderBottomColor: '#993300', marginTop: 0, margin: 10 }} /> */}

											{/* <View style={{marginLeft:20,marginRight:0}}>
												<Dropdown
													label='Select College'
													data={this.state.instituteList}
													onChangeText={(collegeName) => this.setState({ collegeName: collegeName })}
												/>
											</View> */}

											{/* <Grid style={{ marginTop: 20, marginLeft: 8, flex: 0 }}>
												<Col size={1} style={{ justifyContent: 'center' }}>
													<Image style={{ height: 15, width: '90%', marginTop: 4, width: 30 }} tintColor='#993300' source={require('../../images/round_label_black_36dp.png')} />
												</Col>
												<Col size={10}>
													<Form>
														<Item style={{ borderColor: this.state.borderBottomColorNewPassword, borderWidth: 100 }}>
															<Input
																placeholder="Email Id"
																style={{ margin: 0, padding: 0 }}
																selectionColor={this.state.borderBottomColorNewPassword}
																onFocus={() => { this.setState({ borderBottomColorNewPassword: '#800000' }) }}
																onBlur={() => { this.setState({ borderBottomColorNewPassword: '#757575' }); }}
																onChangeText={(email_id) => this.setState({ email_id: email_id })}
															/>
														</Item>
													</Form>
												</Col>
											</Grid>
											{this.state.email_idError ? <Text style={{ color: 'red', textAlign: 'center' }}>{this.state.email_idError}</Text> : <View></View>}

											<View style={{ alignItems: 'flex-end', marginRight: 15, marginTop: 30, marginBottom: 0, bottom: 5 }} >
												<Button rounded style={{ backgroundColor: this.state.email_id ? '#993300' : '#f2f2f2', width: 90, justifyContent: 'center' }} onPress={this.forgotPasswordApi} disabled={this.state.email_id ? false : true} >
													<Text style={{ fontWeight: 'bold' }}> Done</Text>
												</Button>
											</View>

										</View>
									</View>
								</Modal> */}

								<Modal isVisible={this.state.modalVisible}>
									<View style={{ height: 300 }}>
									<Card style={styles.cardContainer}>
										<CardItem header >
											<Text style={{ textAlign:'left', flex: 1,  }}>Forgot Password?</Text>
										<TouchableOpacity onPress={() => { this.setModalVisible(false), this.setState({ email_idError: '', email_id: '' }) }}>
											<Icon type="FontAwesome" name="times" style={{ fontSize: 20, color: 'black', paddingLeft: 13 }} />
										</TouchableOpacity>
                        				</CardItem>
									<View style={{ borderBottomWidth: 1, borderBottomColor: 'grey' }} />
									<View style={{ marginTop: 20 }}>
									<Text>Enter your email address: </Text>
									<TextInput
										placeholder="Email Id"
										style={{ margin: 0, padding: 0 }}
										selectionColor={this.state.borderBottomColorNewPassword}
										onFocus={() => { this.setState({ borderBottomColorNewPassword: '#800000' }) }}
										onBlur={() => { this.setState({ borderBottomColorNewPassword: '#757575' }); }}
										onChangeText={(email_id) => this.setState({ email_id: email_id })}
									/>
									<View style={{ marginTop: 40 }}>
										<Button onPress={this.forgotPasswordApi} disabled={this.state.email_id ? false : true}  title="Done" />
									</View>
									</View>
								</Card>
								</View>
							</Modal>

							</View>
							<View>
								<Content padder>
									<TouchableOpacity onPress={() => this.callForAPI()}>
										<View style={styles.buttonVerifier}>
											<Text style={styles.buttonText}>LOGIN</Text>
										</View>
									</TouchableOpacity>
									<Grid style={{ marginTop: 10 }}>
										<Col>
											<TouchableOpacity style={{ marginTop: 10, paddingLeft: 10 }}>
												<Text style={{ color: '#1784C7', fontSize: 13 }} onPress={() => this.props.navigation.navigate('VerifierSignupScreen')}>Click here to sign up</Text>
											</TouchableOpacity>
										</Col>
										<Col>
											<TouchableOpacity style={{ marginTop: 10, paddingLeft: 10 }}>
												<Text secureTextEntry={true} style={{ color: 'red', fontSize: 13, textAlign: 'center' }} onPress={() => { this.setModalVisible(true) }}>Forgot password</Text>
											</TouchableOpacity>
										</Col>
									</Grid>
								</Content>
							</View>
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
	errorMsg: {
		marginLeft: 18,
		fontSize: 12,
		color: 'red'
	},
	loginViewContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingTop: Dimensions.get('window').height * 0.1
	},
	cardContainer: {
		padding: 15,
		marginTop: 40,
		marginLeft: 30,
		marginRight: 30,
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
	buttonVerifier: {
		marginTop: 10,
		alignItems: 'center',
		backgroundColor: '#0000FF',
		borderRadius: 5
	},
	buttonText: {
		padding: 10,
		color: 'white',
	},
})
const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({ setVerifierData: setVerifierUserData, changeNameForInstitute: changeNameForInstitute }, dispatch)
}
export default connect(null, mapDispatchToProps)(VerifierLoginScreen)