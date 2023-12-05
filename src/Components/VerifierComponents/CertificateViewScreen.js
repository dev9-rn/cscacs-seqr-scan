import React, { Component } from 'react';
import { StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Header, Left, Body, Right, Card, CardItem, Text, Title, Icon } from 'native-base';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Loader from '../../Utilities/Loader';
// import * as app from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default class CertificateViewScreen extends Component {
	constructor(props) {
		super(props);
		console.log("CertificateViewScreen - Data:", this.props.navigation.state.params);
		this.state = {
			userId: '',
			serialNo: '',
			certificateURI: '',
			animating: false,
			loading: false,
			loaderText: 'Please wait downloading file...',
			dataForCertificate: this.props.navigation.state.params.certificateData,
			dataAboveCertificate: this.props.navigation.state.params.dataAboveCertificate

			// dataAboveCertificate: this.props.navigation.state.params.dataAboveCertificate.substring(this.props.navigation.state.params.dataAboveCertificate.lastIndexOf("\n") + 0, -1)
		};
		// console.log(this.props.navigation.state.params.dataAboveCertificate.substring(this.props.navigation.state.params.dataAboveCertificate.lastIndexOf("\n") + 0, -1));
	}


	// componentWillMount() { this._getAsyncData(); }
	componentDidMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackPress); }
	componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); }
	handleBackPress = () => { this.props.navigation.navigate('VerifierMainScreen'); return true; }
	closeActivityIndicator() { setTimeout(() => { this.setState({ animating: false, loading: false }); }); }

	_getAsyncData = async () => {
		await AsyncStorage.multiGet(['USERDATA', 'CERTIFICATESCANNEDDATA'], (err, result) => {		// USERDATA is set on SignUP screen
			var lUserData = JSON.parse(result[0][1]);
			var lData = JSON.parse(result[1][1]);
			console.log(result);
			var lProps = this.props;
			if (lProps.navigation.state.params) {
				if (lData) {
					this.setState({ serialNo: lProps.navigation.state.params.certificateData.serial_no, certificateURI: lProps.navigation.state.params.certificateData.certificate_filename, userId: lUserData.id });
				}
			} else {
				if (lData) {
					this.setState({ serialNo: lData.serial_no, certificateURI: lData.certificate_filename, userId: lUserData.id });
				}
			}
		});
	}
	getLocalPath(url) {
		const filename = url.split('/').pop();
		return `${RNFS.DocumentDirectoryPath}/${filename}`;
	}
	async downloadFile() {
		this.setState({ loading: true });
		const url = this.state.dataForCertificate.fileUrl;
		const localFile = this.getLocalPath(url);
		const options = {
			fromUrl: url,
			toFile: localFile
		};
		RNFS.downloadFile(options).promise
			.then(async () => {
				this.setState({ loading: false });
				setTimeout(() => { FileViewer.open(localFile) }, 500);
			})
			.catch(error => {
				setTimeout(() => {
					this.setState({ animating: false, loading: false });
				}, 2000);
				console.warn("Error in downloading file" + error);
			});
	}

	_showHeader() {
		if (Platform.OS == 'ios') {
			return (
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierMainScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body style={{ marginLeft: -50, width: '100%' }}>
						<Title style={{ color: '#FFFFFF' }}>Scanned details</Title>
					</Body>
					<Right>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierScanScreen')}>
							<Title style={{ color: '#FFFFFF' }}>SCAN NEW</Title>
						</TouchableOpacity>
					</Right>
				</Header>
			)
		} else {
			return (
				<Header style={{ backgroundColor: '#0000FF' }}>
					<Left>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierMainScreen')}>
							<Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: '#FFFFFF', paddingLeft: 10, paddingRight: 10 }} />
						</TouchableOpacity>
					</Left>
					<Body>
						<Title style={{ color: '#FFFFFF', fontSize: 16 }}>Scanned details</Title>
					</Body>
					<Right>
						<TouchableOpacity onPress={() => this.props.navigation.navigate('VerifierScanScreen')}>
							<Title style={{ color: '#FFFFFF', fontSize: 16 }}>SCAN NEW</Title>
						</TouchableOpacity>
					</Right>
				</Header>
			)
		}
	}

	render() {
		const source = { uri: encodeURI(this.state.dataForCertificate.fileUrl), cache: false };
		return (
			<View style={styles.container}>
				{this._showHeader()}
				<StatusBar barStyle="light-content" />
				<Loader loading={this.state.loading} text={this.state.loaderText} />
				<View style={styles.certificateViewContainer}>
					<Card style={styles.cardContainer}>
						<ScrollView keyboardShouldPersistTaps="always">
							<CardItem style={styles.cardHeader}>
								{this.state.dataAboveCertificate ?
									<View style={{ flex: 1 }}>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>Document ID : {this.state.dataForCertificate.serial_no}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>Data :
											{
												this.props.navigation.state.params.dataAboveCertificate.trim()
											}
										</Text>
										{/* <Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.name ? this.state.dataAboveCertificate.name : ""}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.enrollmentNo ? this.state.dataAboveCertificate.enrollmentNo : ""}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.degree ? this.state.dataAboveCertificate.degree : ""}</Text>
										<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>{this.state.dataAboveCertificate.pointer ? this.state.dataAboveCertificate.pointer : ""}</Text> */}
									</View>
									:
									<Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'bold', fontSize: 16 }}>Document ID : {this.state.dataForCertificate.serial_no}</Text>
								}
							</CardItem>
							<View style={{ paddingTop: 10, height: Dimensions.get('window').height * 0.7 }}>
								<View style={{ flex: 0.1, flexDirection: 'row' }}>
									<Text style={{ fontSize: 22, flex: 0.9 }}>Document</Text>
									{/* <TouchableOpacity style={{ flex: 0.1 }} onPress={() => { this.downloadFile() }}>
										<Image
											style={{ width: 30, height: 30 }}
											source={require('../../../images/forward_arrow.png')}
										/>
									</TouchableOpacity> */}
								</View>
								<Pdf
									source={source}
									cache={false}
									expiration={2}
									trustAllCerts={false}
									onLoadComplete={(numberOfPages, filePath) => {
										console.log(`number of pages: ${numberOfPages}`);
									}}
									onPageChanged={(page, numberOfPages) => {
										console.log(`current page: ${page}`);
									}}
									onError={(error) => {
										console.log(error);
									}}
									style={styles.pdf} />

							</View>
						</ScrollView>
					</Card>
				</View>
			</View>
		)
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	certificateViewContainer: {
		flex: 1,
		// flexDirection: 'column',
		// alignItems: 'stretch',
		// paddingTop: Dimensions.get('window').height * 0.01
	},
	cardContainer: {
		padding: 15,
		marginTop: 10,
		marginLeft: 20,
		marginRight: 20
	},
	cardHeader: {
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0'
	},
	containerPDF: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		marginTop: 25,
	},
	pdf: {
		flex: 1,
		// width:Dimensions.get('window').width,
	}
});