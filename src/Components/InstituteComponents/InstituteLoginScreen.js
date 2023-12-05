import React, { Component } from 'react';
import { BackHandler, StatusBar, Dimensions, Platform, StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Header, Left, Body, Card, CardItem, Text, Title, Icon, Toast } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Loader from '../../Utilities/Loader';
import * as utilities from '../../Utilities/utilities';
import { URLFORINSTITUTE, APIKEY } from '../../../App';
import { connect } from 'react-redux';
import { setIntituteUserData, instituteURL } from '../../Redux/Actions/InstituteActions';
import { bindActionCreators } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-material-dropdown';
import { Grid, Col } from 'react-native-easy-grid';

var data = [{
	value: 'G H Raisoni College of Engineering, Nagpur',
}
// , {
// 	value: 'G H Raisoni University - Saikheda',
// }
];

class InstituteLoginScreen extends Component {
	constructor(props) {
		super(props);

		this.state = {
			username: '',
			password: '',
			borderBottomColorPassword: '#757575',
			borderBottomColorUserName: '#757575',
			loading: false,
			loaderText: 'Logging in...',
			urlForInstitute: ''
		};
	}
	componentDidMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackPress); }
	componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); }

	handleBackPress = () => {
		this.setState({ loading: false });
		// BackHandler.exitApp();
		this.props.navigation.navigate('HomeScreen');
		return true;
	}
	showToastMsg = (msg) => {
		Toast.show({
			text: msg,
			style: { position: 'absolute', bottom: 10, left: 10, right: 10, borderRadius: 5, margin: 20 }
		});
	}
	async callForAPI() {
		if (this.state.urlForInstitute === '') {
			utilities.showToastMsg('Please select College');
			return;
		} else if (!this.state.username) {
			utilities.showToastMsg('Username cannot be empty.');
			return;
		} else if (!this.state.password) {
			utilities.showToastMsg('Password cannot be empty.');
			return;
		} else {
			this.setState({ loading: true })
			const formData = new FormData();
			formData.append('institute_username', this.state.username);
			formData.append('password', this.state.password);
			// formData.append('device_type', Platform.OS);
			// formData.append('lat', '');
			// formData.append('long', '');
			console.log(formData);
			var lUrl = URLFORINSTITUTE + 'institute-login'
			fetch(lUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart\/form-data',
					'apikey': APIKEY,
				},
				body: formData,
			}).then(res => res.json())
				.then(lResponseData => {
					this.setState({ loading: false })
					console.log("Institute login data response",lResponseData);
					if (!lResponseData) {
						this.showToastMsg('Something went wrong. Please try again later');
					} else if (lResponseData.status == "400") {
						this.showToastMsg('Wrong login credentials! Please check and try again');
					} else if (lResponseData.status == '200') {
						this.showToastMsg('Logged in successfully.');
						console.log('======== institute' , JSON.stringify(lResponseData,null,2))
						try {
							lResponseData.password = this.state.password;
							lResponseData.status = '1';
							lResponseData.username = this.state.username;
							AsyncStorage.setItem('InstituteData', JSON.stringify(lResponseData))
							this.props.navigation.navigate('InstituteMainScreen')
						} catch (error) {
							console.warn(error);
						}
					} else {
						this.showToastMsg('Something went wrong. Please try again later');
					}
				})
				.catch(error => {
					this.setState({ loading: false })
					console.log(error);
				});
		}
	}
	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#94302C' }}>
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
				<Header style={{ backgroundColor: '#94302C' }}>
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
	setCollege = (collegeName) => {
		if (collegeName === 'G H Raisoni College of Engineering, Nagpur') {

			this.props.institutesURL("https://raisoni.seqronline.com/services/")

			this.setState({ urlForInstitute: "https://raisoni.seqrdoc.com/api/" })
			AsyncStorage.setItem('InstituteURL', "https://raisoni.seqrdoc.com/api/");
		} else {
			this.props.institutesURL("https://ghrusaikheda.seqronline.com/services/")

			// this.setState({ urlForInstitute: "http://192.168.0.5:808/saikheda/services/" })

			this.setState({ urlForInstitute: "https://ghrusaikheda.seqronline.com/services/" })
			AsyncStorage.setItem('InstituteURL', "https://ghrusaikheda.seqronline.com/services/");
		}
	}
	render() {
		return (
			<View style={styles.container}>
				{this._showHeader()}
				<StatusBar
					backgroundColor="#94302C"
					barStyle="light-content"
				/>
				<Loader
					loading={this.state.loading}
					text={this.state.loaderText}
				/>
				{/* <View style={{ marginLeft: 30, marginRight: 30, marginTop: 40 }}>
					<Dropdown
						label='Select College'
						data={data}
						onChangeText={(collegeName) => this.setCollege(collegeName)}
					/>
				</View> */}

				<View style={styles.loginViewContainer}>
					<ScrollView keyboardShouldPersistTaps="always">
						<Card style={styles.cardContainer}>
							<CardItem header style={styles.cardHeader}>
								<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Login</Text>
							</CardItem>

							{/* <View style={{ marginLeft: 10, marginRight: 10 }}>
								<Dropdown
									label='Passout Year'
									data={data}
								// onChangeText={(passoutYear) => this.setYear(passoutYear)}
								/>
							</View> */}
							<View>
								<Dropdown
									label='Select College'
									data={data}
									onChangeText={(collegeName) => this.setCollege(collegeName)}
								/>
							</View>

							<View style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
								<View style={styles.inputContainer}>
									<TextInput
										style={{
											borderBottomColor: this.state.borderBottomColorUserName,
											...styles.inputs
										}}
										placeholder='Username'
										// value="Ankit"
										color='black'
										placeholderTextColor='grey'
										onFocus={() => { this.setState({ borderBottomColorUserName: '#D24943' }) }}
										onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }) }}
										onChangeText={(username) => this.setState({ username })} />

									<TextInput
										style={{
											borderBottomColor: this.state.borderBottomColorPassword,
											...styles.inputs
										}}
										placeholder='Password'
										// value="ankit@123"
										color='black'
										placeholderTextColor='grey'
										secureTextEntry={true}
										onFocus={() => { this.setState({ borderBottomColorPassword: '#D24943' }) }}
										onBlur={() => this.setState({ borderBottomColorPassword: '#757575' })}
										onChangeText={(password) => this.setState({ password: password })} />
								</View>
							</View>
							<View>
								<TouchableOpacity onPress={() => this.callForAPI()}>
									<View style={styles.buttonVerifier}>
										<Text style={styles.buttonText}>LOGIN</Text>
									</View>
								</TouchableOpacity>
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
	loginViewContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingTop: Dimensions.get('window').height * 0.120
	},
	cardContainer: {
		padding: 15,
		marginTop: 40,
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
	buttonVerifier: {
		marginTop: 10,
		alignItems: 'center',
		backgroundColor: '#D24943',
		borderRadius: 5
	},
	buttonText: {
		padding: 10,
		color: 'white',
	},
});
const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({ setIntituteData: setIntituteUserData, institutesURL: instituteURL }, dispatch)
}
export default connect(null, mapDispatchToProps)(InstituteLoginScreen)