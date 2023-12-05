import React, { Component } from 'react';
import { BackHandler, StatusBar, StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

export default class HomeScreen extends Component {
	componentDidMount() {
		console.log("in home");
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress); SplashScreen.hide()
	}
	componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); }
	handleBackPress = () => { BackHandler.exitApp(); return true; }
	_onPressButton(pLoginType) { this.props.navigation.navigate(pLoginType); }
	render() {
		return (
			<View style={styles.container}>
				<StatusBar backgroundColor="#0000FF" />
				<View style={{ flex: 1 }}>
					<View style={styles.containerLevel1}>
						<Text style={{ textAlign: 'center', fontSize: 20}}>
							<Text style={{ color: '#0000FF' }}>Demo </Text>
							<Text style={{ color: '#7b8fb7' }}>SeQR SCAN </Text>
						</Text>
					</View>
				</View>
				<View style={{ flex: 1.9 }}>
					<Image style={{ width: 300, height: 300 }} source={require('../images/wwe.png')} resizeMode='contain' />
				</View>
				<View style={{ flex: 1 }}>
					{/* <TouchableOpacity onPress={() => this._onPressButton('StudentLoginScreen')}>
						<View style={styles.buttonStudent}>
							<Text style={{ color: '#669900', padding: 12, fontWeight: 'bold' }}>SIGN IN AS STUDENT</Text>
						</View>
					</TouchableOpacity> */}

					{/* <TouchableOpacity onPress={() => this._onPressButton('VerifierLoginScreen')}> */}
					<TouchableOpacity onPress={() => this._onPressButton('VerifierLoginScreen')}>
						<View style={styles.buttonVerifier}>
							<Text style={{ color: '#ffffff', padding: 12, fontWeight: 'bold' }}>SIGN IN AS VERIFIER</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => this._onPressButton('InstituteLoginScreen')}>
						<View style={styles.buttonInstitute}>
							<Text style={{ color: '#ffffff', padding: 12, fontWeight: 'bold' }}>SIGN IN AS INSTITUTE</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
		flexDirection: 'column'
	},
	containerLevel1: {
		alignItems: 'center',
		paddingTop: Dimensions.get('window').width * 0.3
	},
	buttonVerifier: {
		width: 260,
		alignItems: 'center',
		backgroundColor: '#0000FF',
		borderRadius: 30
	},
	buttonInstitute: {
		marginTop: 10,
		marginBottom: 30,
		width: 260,
		alignItems: 'center',
		borderRadius: 30,
		backgroundColor: '#b63a3b'
	},
	buttonStudent: {
		// marginTop: 10,
		marginBottom: 10,
		width: 260,
		alignItems: 'center',
		borderRadius: 30,
		backgroundColor: '#ff9933'
	}
});