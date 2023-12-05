import React, { Component } from 'react';
import { StatusBar, BackHandler, Platform, View, Image, TouchableOpacity, TextInput, ScrollView, StyleSheet, PermissionsAndroid, Alert, Modal } from 'react-native';
import { Header, Content, Card, Text, Title, Item, Label, Input, Icon, Form, } from 'native-base';
import * as utilities from '../../../Utilities/utilities';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clearTheStoreOnLogout, changeNameForInstituteRequestForm } from '../../../Redux/Actions/VerifierActions';
import { Col, Row, Grid } from 'react-native-easy-grid';
import Loader from '../../../Utilities/Loader';
import { Dropdown } from 'react-native-material-dropdown';
import { URL, APIKEY } from '../../../../App';
var _ = require('lodash');
import DocumentPicker from 'react-native-document-picker';
import PricesTable from './PricesTable';
// import InAppBrowser from 'react-native-inappbrowser-reborn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-picker';
import RBSheet from "react-native-raw-bottom-sheet";
import ImageResizeMode from 'react-native/Libraries/Image/ImageResizeMode';
// import { Table, Rows } from 'react-native-table-component';
import { WebView } from 'react-native-webview';

class RequestVerification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            loaderText: 'Please wait...',
            studentName: '',
            studentNameError: '',
            studentRegNo: '',
            studentRegNoError: '',
            institute: '',
            passoutYearList: [],
            branchList: [],
            avatarSource: '',
            File1: '',
            File2: '',
            File3: '',
            File4: '',
            File5: '',
            File6: '',
            File7: '',
            File8: '',
            File9: '',
            File10: '',
            File11: '',
            CountOfFiles: 0,
            totalForGradeCards: 0,
            gradeCardsAmount: 0,
            totalForProvisionalDegree: 0,
            provisionalDegreesAmount: 0,
            totalForOriginalDegree: 0,
            originalDegreesAmount: 0,
            totalForMarksheet: 0,
            marksheetsForStudentsAmount: 0,
            totalAmount: 0,
            grade_card: [],
            provision_degree: [],
            original_degree: [],
            marksheet: [],
            showHide: false,
            requestParameter: '',
            disableTheFields: false,
            passoutYear: '',
            degreeName: '',
            branchName: '',
            branch: '',
            isPdf: false,
            isPdf1: false,
            isPdf2: false,
            isPdf3: false,
            isPdf4: false,
            isPdf5: false,
            isPdf6: false,
            isPdf7: false,
            isPdf8: false,
            isPdf9: false,
            isPdf10: false,
            isPdf11: false,
            isThisThePdf: false,
            gradeCardAmount: '',
            provisionalDegreeAmount: '',
            originalDegreeAmount: '',
            marksheetAmount: '',
            recruiterName: '',
            recruiterNameError: '',
            tableHead: [],
            tableData: [],
            gradeCardAmount: '',
            provisionalDegreeAmount: '',
            originalDegreeAmount: '',
            marksheetAmount: '',
            showHideBangdu: false,
            changeInsti: "",
            pay_url:''
        };
    }
    requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: 'Cool Photo App Camera Permission',
                    message:
                        'Cool Photo App needs access to your camera ' +
                        'so you can take awesome pictures.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('You can use the camera');
            } else {
                console.log('Camera permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    }
    componentWillMount = () => {
        this.degreeApi()
    }
    componentDidMount = () => {
        this.requestCameraPermission()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this.instituteApi()
        this.getYearsList()
       
        if (this.props.isUserStudent == 0) {
            this.getUserProfile();
        }
    }
    componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); }
    handleBackPress = () => { this.props.navigation.navigate('VerifierMainScreen'); return true; }
    _aboutUs() { this.props.navigation.navigate('AboutUs'); }
    getUserProfile = async () => {
        this.setState({ loading: true, disableTheFields: true })
        const formData = new FormData();
        formData.append('type', 'get_user_profile');
        formData.append('user_id', this.props.user_id);
        formData.append('user_type', this.props.userType);
        formData.append('institute', this.props.changedInstituteName);

        console.log("=-=-=-=-=");
        console.log("user-profile form data",formData);

        fetch(`${URL}user-profile`, {
            method: 'POST',
            headers: {
                'Accept': 'application\/json',
                'Content-Type': 'multipart\/form-data',
                'apikey': APIKEY,
                'accesstoken': this.props.accessToken
            },
            body: formData,
        }).then(res => res.json())
            .then(async response => {
                console.log("user-profile response",response);
                this.setState({ loading: false })
                if (response.status == 200) {
                    this.getDocumentPrices(response.data[0].institute);
                    console.log(response.data.degree_name);
                    await this.selectDegreeID(response.data[0].degree_name, this.state.degreeList);
                    await this.setState({
                        studentName: `${response.data[0].fullname} ${response.data[0].l_name}`, studentRegNo: response.data[0].registration_no,
                        institute: response.data[0].institute, degreeName: response.data[0].degree_name, branchName: response.data[0].branch_name_long,
                        passoutYear: response.data[0].passout_year
                    })
                } else if (response.status == 409) { utilities.showToastMsg(response.message); }
                else if (response.status == 422) { utilities.showToastMsg(response.message); }
                else if (response.status == 400) { utilities.showToastMsg(response.message); }
                else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
                else if (response.status == 405) { utilities.showToastMsg(response.message); }
            })
            .catch(error => {
                this.setState({ loading: false })
                console.log("user-profile error",error);
            });
    }

    _removeAccount(){
        // utilities.showToastMsg("Account removed successfully");
        this.props.navigation.navigate('RemoveAccount'); 
    }
    
    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#0000FF' }}>
                    <Grid>
                        <Col size={2} style={{ justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierMainScreen")}>
                                <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={8} style={{ justifyContent: 'center' }}>
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Request Verification Form</Title>
                        </Col>
                        <Col size={2} style={{ justifyContent: 'center', alignItems: 'flex-end', marginRight: 3 }}>
                            <Menu>
                                <MenuTrigger>
                                    <Image style={{ width: 20, height: 20, paddingRight: 15 }} source={require('../../../images/three_dots.png')} />
                                </MenuTrigger>
                                <MenuOptions>
                                    <MenuOption onSelect={() => this._aboutUs()} style={{ padding: 15 }}>
                                        <Text style={{ color: 'black' }}>About us</Text>
                                    </MenuOption>
                                    <MenuOption onSelect={() => this._removeAccount()} style={{ padding: 15 }}>
                                        <Text style={{ color: 'red' }}>Remove Account</Text>
                                    </MenuOption>
                                    <MenuOption onSelect={() => this._callForLogoutAPI()} style={{ padding: 15 }} >
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
                <Header style={{ backgroundColor: '#0000FF' }}>
                    <Grid>
                        <Col size={2} style={{ justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierMainScreen")}>
                                <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={8} style={{ justifyContent: 'center' }}>
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Request Verification Form</Title>
                        </Col>
                        <Col size={2} style={{ justifyContent: 'center', alignItems: 'flex-end', marginRight: 3 }}>
                            <Menu>
                                <MenuTrigger>
                                    <Image style={{ width: 20, height: 20, paddingRight: 15 }} source={require('../../../images/three_dots.png')} />
                                </MenuTrigger>
                                <MenuOptions>
                                    <MenuOption onSelect={() => this._aboutUs()} style={{ padding: 15 }}>
                                        <Text style={{ color: 'black' }}>About us</Text>
                                    </MenuOption>
                                    <MenuOption onSelect={() => this._removeAccount()} style={{ padding: 15 }}>
                                        <Text style={{ color: 'red' }}>Remove Account</Text>
                                    </MenuOption>
                                    <MenuOption onSelect={() => this._callForLogoutAPI()} style={{ padding: 15 }} >
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
    instituteApi = () => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('type', 'institute');
        fetch(`${URL}dropdown`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart\/form-data',
                'apikey': APIKEY,
               // 'accesstoken': this.props.accessToken
            },
            body: formData,
        }).then(res => res.json())
            .then(response => {
                this.setState({ loading: false })
                console.log("institute dropdown resp",response);
                if (response.status == 200) {
                    this.setState({ instituteList: response.data })
                } else if (response.status == 409) { utilities.showToastMsg(response.message); }
                else if (response.status == 422) { utilities.showToastMsg(response.message); }
                else if (response.status == 400) { utilities.showToastMsg(response.message); }
                else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
                else if (response.status == 405) { utilities.showToastMsg(response.message); }
            })
            .catch(error => {
                this.setState({ loading: false })
                console.log(error);
            });
    }
    degreeApi = () => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('type', 'degree');
        fetch(`${URL}dropdown`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart\/form-data',
                'apikey': APIKEY,
                // 'accesstoken': this.props.accessToken
            },
            body: formData,
        }).then(res => res.json())
            .then(response => {
                this.setState({ loading: false })
                console.log("degree resp",response);
                if (response.status == 200) {
                    this.setState({ degreeList: response.data })
                } else if (response.status == 409) { utilities.showToastMsg(response.message); }
                else if (response.status == 422) { utilities.showToastMsg(response.message); }
                else if (response.status == 400) { utilities.showToastMsg(response.message); }
                else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
                else if (response.status == 405) { utilities.showToastMsg(response.message); }
            })
            .catch(error => {
                this.setState({ loading: false })
                console.log(error);
            });
    }
    branchesApi = (degreeID) => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('type', 'branch');
        formData.append('degree_id', degreeID);

        fetch(`${URL}dropdown`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart\/form-data',
                'apikey': APIKEY,
                // 'accesstoken': this.props.accessToken
            },
            body: formData,
        }).then(res => res.json())
            .then(response => {
                this.setState({ loading: false })
                console.log("branch respo",response);
                if (response.status == 200) {
                    this.setState({ branchList: response.data })
                    if (this.state.branchName) {
                        this.settingBranch(this.state.branchName, this.state.branchList)
                    }
                    this.setState(this.state);
                } else if (response.status == 409) { utilities.showToastMsg(response.message); }
                else if (response.status == 422) { utilities.showToastMsg(response.message); }
                else if (response.status == 400) { utilities.showToastMsg(response.message); }
                else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
                else if (response.status == 405) { utilities.showToastMsg(response.message); }
            })
            .catch(error => {
                this.setState({ loading: false })
                console.log(error);
            });
    }
    getYearsList = () => {
        var currentYear = new Date().getFullYear(),
            startYear = 2000;
        for (var i = startYear; i <= currentYear; i++) {
            var obj = {}
            obj.value = i
            this.state.passoutYearList.push(obj)
        }
    }
    selectDegreeID = (degree, listOfDegrees) => {
        let idForDegree = _.filter(listOfDegrees, { value: degree })[0].id
        this.setState({ degree: idForDegree, branchList: [] })
        this.branchesApi(idForDegree)
    }
    settingBranch = (branch, branchList) => {
        let idForBranch = _.filter(branchList, { value: branch })[0].id
        this.setState({ branch: idForBranch })
    }
    setYear = (yr) => {
        this.setState({ passoutYear: yr })
    }
    openImageGallery = async (isImageOrPDf) => {
        if (isImageOrPDf === 'image') {
            ImagePicker.showImagePicker({ title: "Pick an image" }, response => {
                console.log("image response", response.uri);
                if (response.didCancel) {
                    // alert("u have cancelled.")
                } else if (response.error) {
                    alert("u have an error.")
                } else {
                    console.log(response);
                    if (response.type === "application/pdf" || response.type === "image/jpeg" || response.type === "image/jpg" || !response.type || response.type === "image/png") {
                        if (!response.type || response.type === "application/pdf") {
                            // const temp = JSON.stringify(response);
                            console.log("inside 1 -- - - - -1");
                            var i = response.uri.lastIndexOf("/") + 1;
                            var wwe = response.uri.substr(i);
                            var j = wwe.lastIndexOf('.') + 1;
                            var k = wwe.substr(j)

                            if (response.uri.split('.')[1] === 'apk' || k === 'zip' || k === 'js' || k === 'html' || k === 'json' || k === 'txt' || k === 'xlsx' || k === 'docx' || j == 0) {
                                Alert.alert(
                                    'Please select proper file format from below mentioned.',
                                    'PNG, JPG, JPEG, PDF',
                                    [
                                        { text: 'OK', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                                    ],
                                    { cancelable: false }
                                );
                                return;
                            }
                            var index = response.uri.lastIndexOf("/") + 1;
                            var filename1 = response.uri.substr(index);
                            const source = { uri: response.uri, name: filename1, type: 'application/pdf' };
                            this.setState({ avatarSource: source, isPdf: true })
                        } else {
                            console.log("inside 2 --- - -- 2");
                             //////
                             let path = response.uri;
                             if (Platform.OS === "ios") {
                                path = "~" + path.substring(path.indexOf("/Documents"));
                             }
                             if (!response.fileName) response.fileName = path.split("/").pop();
                             ////////
                            const source = { uri: response.uri, name: response.fileName, type: response.type };
                            this.setState({ avatarSource: source, isPdf: false })
                            console.log(source, "image");
                            this.RBSheet.close()
                        }
                    } else {
                        Alert.alert(
                            'Please select proper file format from below mentioned.',
                            'PNG, JPG, JPEG, PDF',
                            [
                                { text: 'OK', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                            ],
                            { cancelable: false }
                        );
                    }

                }
            });
        } else {
            try {
                const response = await DocumentPicker.pick({
                    // type: [DocumentPicker.types.pdf],
                    // type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
                    type: [DocumentPicker.types.pdf],
                });
                console.log(response);
                if (response.type === "application/pdf" || response.type === "image/jpeg" || response.type === "image/jpg" || !response.type || response.type === "image/png") {
                    if (!response.type || response.type === "application/pdf") {
                        this.RBSheet.close()
                        let obj = JSON.stringify(response);
                        var temp1 = JSON.parse(obj);
                        var temp = temp1[0].uri
                        console.log("inside 1 -- - - - -3", temp);
                        var i = temp.lastIndexOf("/") + 1;
                        var wwe = temp.substr(i);
                        var j = wwe.lastIndexOf('.') + 1;
                        var k = wwe.substr(j)

                        if (temp.split('.')[1] === 'apk' || k === 'zip' || k === 'js' || k === 'html' || k === 'json' || k === 'txt' || k === 'xlsx' || k === 'docx' || j == 0) {
                            Alert.alert(
                                'Please select proper file format from below mentioned.',
                                'PNG, JPG, JPEG, PDF',
                                [
                                    { text: 'OK', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                            );
                            return;
                        }
                        var index = temp.lastIndexOf("/") + 1;
                        var filename = temp.substr(index);
                        const source = { uri: temp, name: filename, type: 'application/pdf' };
                        console.log(source, "source");
                        this.setState({ avatarSource: source, isPdf: true })
                    } else {
                        console.log("inside 2 --- - -- 4");
                        const source = { uri: response.uri, name: response.name, type: response.type };
                        this.setState({ avatarSource: source, isPdf: false })
                    }
                } else {
                    Alert.alert(
                        'Please select proper file format from below mentioned.',
                        'PNG, JPG, JPEG, PDF',
                        [
                            { text: 'OK', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                        ],
                        { cancelable: false }
                    );
                }
            } catch (err) {
                if (DocumentPicker.isCancel(err)) {
                    // User cancelled the picker, exit any dialogs or menus and move on
                    this.setState({ avatarSource: '', isPdf: false })
                } else {
                    throw err;
                }
            }
        }


    }
    openImageGalleryForUploads = async (nameOfFile, itsPdfORImage) => {
        try {
            var source = ""
            if (itsPdfORImage === 'image') {
                ImagePicker.showImagePicker({ title: "Pick an image" }, response => {
                    if (response.didCancel) {
                        // alert("u have cancelled.")
                    } else if (response.error) {
                        alert("u have an error.")
                    } else {
                        console.log(response);
                        if (response.type === "application/pdf" || response.type === "image/jpeg" || response.type === "image/jpg" || !response.type || response.type === "image/png") {
                            if (!response.type || response.type === "application/pdf") {
                                var i = response.uri.lastIndexOf("/") + 1;
                                var wwe = response.uri.substr(i);
                                var j = wwe.lastIndexOf('.') + 1;
                                var k = wwe.substr(j)

                                if (response.uri.split('.')[1] === 'apk' || k === 'zip' || k === 'js' || k === 'html' || k === 'json' || k === 'txt' || k === 'xlsx' || k === 'docx' || j == 0) {
                                    Alert.alert(
                                        'Please select proper file format from below mentioned.',
                                        'PNG, JPG, JPEG, PDF',
                                        [
                                            { text: 'OK', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                                        ],
                                        { cancelable: false }
                                    );
                                    return;
                                }
                                var index = response.uri.lastIndexOf("/") + 1;
                                var filename = response.uri.substr(index);
                                source = { uri: response.uri, name: filename, type: 'application/pdf' };
                                this.setState({ isThisThePdf: true })
                            } else {
                                //////
                                let path = response.uri;
                                if (Platform.OS === "ios") {
                                   path = "~" + path.substring(path.indexOf("/Documents"));
                                }
                                if (!response.fileName) response.fileName = path.split("/").pop();
                                ////////
                                source = { uri: response.uri, name: response.fileName, type: response.type };
                                this.setState({ isThisThePdf: false })
                            }
                            console.log("source data type..........",source);
                            if (nameOfFile === "File1") {
                                this.RBSheet1.close()
                                console.log("inside 1");
                                if (!this.state.File1) {
                                    console.log("inside 1 .", source);
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForGradeCards: this.state.totalForGradeCards + 1 })
                                    if (this.state.isThisThePdf) {
                                        this.setState({ isPdf1: true })
                                    } else {
                                        this.setState({ isPdf1: false })
                                    }
                                }
                              
                                this.setState({ File1: source })
                                // console.log("inside----- .", this.state.File1);
                            } else if (nameOfFile === "File2") {
                                this.RBSheet2.close()
                                console.log("inside 2");
                                if (!this.state.File2) {
                                    console.log("inside 2");
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForGradeCards: this.state.totalForGradeCards + 1, })
                                    if (this.state.isThisThePdf) {
                                        this.setState({ isPdf2: true })
                                    } else {
                                        this.setState({ isPdf2: false })
                                    }
                                }
                                this.setState({ File2: source, })
                            } else if (nameOfFile === "File3") {
                                this.RBSheet3.close()
                                console.log("inside 3");
                                if (!this.state.File3) {
                                    console.log("inside 3");
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForGradeCards: this.state.totalForGradeCards + 1 })
                                    if (this.state.isThisThePdf) {
                                        this.setState({ isPdf3: true })
                                    } else {
                                        this.setState({ isPdf3: false })
                                    }
                                }
                                this.setState({ File3: source, })
                            } else if (nameOfFile === "File4") {
                                this.RBSheet4.close()
                                console.log("inside 4");
                                if (!this.state.File4) {
                                    console.log("inside 4");
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForGradeCards: this.state.totalForGradeCards + 1 })
                                    if (this.state.isThisThePdf) {
                                        this.setState({ isPdf4: true })
                                    } else {
                                        this.setState({ isPdf4: false })
                                    }
                                }
                                this.setState({ File4: source, })
                            } else if (nameOfFile === "File5") {
                                this.RBSheet5.close()
                                if (!this.state.File5) {
                                    console.log("inside 5");
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForProvisionalDegree: this.state.totalForProvisionalDegree + 1 })
                                } if (this.state.isThisThePdf) {
                                    this.setState({ isPdf5: true })
                                } else {
                                    this.setState({ isPdf5: false })
                                }
                                this.setState({ File5: source, })
                            } else if (nameOfFile === "File6") {
                                this.RBSheet6.close()
                                console.log("inside 6");
                                if (!this.state.File6) {
                                    console.log("inside 6");
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForProvisionalDegree: this.state.totalForProvisionalDegree + 1 })
                                }
                                if (this.state.isThisThePdf) {
                                    this.setState({ isPdf6: true })
                                } else {
                                    this.setState({ isPdf6: false })
                                }
                                this.setState({ File6: source, })
                            } else if (nameOfFile === "File7") {
                                this.RBSheet7.close()
                                console.log("inside 7");
                                if (!this.state.File7) {
                                    console.log("inside 7");
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForOriginalDegree: this.state.totalForOriginalDegree + 1 })
                                }
                                if (this.state.isThisThePdf) {
                                    this.setState({ isPdf7: true })
                                } else {
                                    this.setState({ isPdf7: false })
                                }
                                this.setState({ File7: source, })
                            } else if (nameOfFile === "File8") {
                                this.RBSheet8.close()
                                console.log("inside 8");
                                if (!this.state.File8) {
                                    console.log("inside 8");
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForOriginalDegree: this.state.totalForOriginalDegree + 1 })
                                }
                                if (this.state.isThisThePdf) {
                                    this.setState({ isPdf8: true })
                                } else {
                                    this.setState({ isPdf8: false })
                                }
                                this.setState({ File8: source, })
                            } else if (nameOfFile === "File9") {
                                this.RBSheet9.close()
                                if (!this.state.File9) {
                                    console.log("inside 9");
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForMarksheet: this.state.totalForMarksheet + 1 })
                                }
                                if (this.state.isThisThePdf) {
                                    this.setState({ isPdf9: true })
                                } else {
                                    this.setState({ isPdf9: false })
                                }
                                this.setState({ File9: source, })
                            } else if (nameOfFile === "File10") {
                                this.RBSheet10.close()
                                if (!this.state.File10) {
                                    console.log("inside 10");
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForMarksheet: this.state.totalForMarksheet + 1 })
                                }
                                if (this.state.isThisThePdf) {
                                    this.setState({ isPdf10: true })
                                } else {
                                    this.setState({ isPdf10: false })
                                }
                                console.log("inside 10 =-=-=-=-=");
                                this.setState({ File10: source, })
                            } else if (nameOfFile === "File11") {
                                this.RBSheet11.close()
                                console.log("inside 11");
                                if (!this.state.File11) {
                                    console.log("inside 11");
                                    this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForGradeCards: this.state.totalForGradeCards + 1 })
                                }
                                if (this.state.isThisThePdf) {
                                    this.setState({ isPdf11: true })
                                } else {
                                    this.setState({ isPdf11: false })
                                }
                                this.setState({ File11: source, })
                            }
                            this.setState({ gradeCardsAmount: this.state.totalForGradeCards * this.state.gradeCardAmount, provisionalDegreesAmount: this.state.totalForProvisionalDegree * this.state.provisionalDegreeAmount, originalDegreesAmount: this.state.totalForOriginalDegree * this.state.originalDegreeAmount, marksheetsForStudentsAmount: this.state.totalForMarksheet * this.state.marksheetAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount }))
                        } else {
                            Alert.alert(
                                'Please select proper file format from below mentioned.',
                                'PNG, JPG, JPEG, PDF',
                                [
                                    { text: 'OK', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                            );
                        }
                    }
                })
            } else {
                const response = await DocumentPicker.pick({
                    type: [DocumentPicker.types.pdf],
                });
                console.log(response);

                if (response.type === "application/pdf" || response.type === "image/jpeg" || response.type === "image/jpg" || !response.type || response.type === "image/png") {
                    if (!response.type || response.type === "application/pdf") {
                        var i = response.uri.lastIndexOf("/") + 1;
                        var wwe = response.uri.substr(i);
                        var j = wwe.lastIndexOf('.') + 1;
                        var k = wwe.substr(j)

                        if (response.uri.split('.')[1] === 'apk' || k === 'zip' || k === 'js' || k === 'html' || k === 'json' || k === 'txt' || k === 'xlsx' || k === 'docx' || j == 0) {
                            Alert.alert(
                                'Please select proper file format from below mentioned.',
                                'PNG, JPG, JPEG, PDF',
                                [
                                    { text: 'OK', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                                ],
                                { cancelable: false }
                            );
                            return;
                        }
                        var index = response.uri.lastIndexOf("/") + 1;
                        var filename = response.uri.substr(index);
                        source = { uri: response.uri, name: filename, type: 'application/pdf' };
                        this.setState({ isThisThePdf: true })
                    } else {
                        console.log("3");

                        source = { uri: response.uri, name: response.fileName, type: response.type };
                        this.setState({ isThisThePdf: false })
                    }
                    if (nameOfFile === "File1") {
                        this.RBSheet1.close()
                        console.log("inside 1");
                        if (!this.state.File1) {
                            console.log("inside 1 .", source);
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForGradeCards: this.state.totalForGradeCards + 1 })
                            if (this.state.isThisThePdf) {
                                this.setState({ isPdf1: true })
                            } else {
                                this.setState({ isPdf1: false })
                            }
                        }
                        this.setState({ File1: source })
                        console.log(this.state.File1, "File1-------");
                    } else if (nameOfFile === "File2") {
                        this.RBSheet2.close()
                        console.log("inside 2");
                        if (!this.state.File2) {
                            console.log("inside 2");
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForGradeCards: this.state.totalForGradeCards + 1, })
                            if (this.state.isThisThePdf) {
                                this.setState({ isPdf2: true })
                            } else {
                                this.setState({ isPdf2: false })
                            }
                        }
                        this.setState({ File2: source, })
                    } else if (nameOfFile === "File3") {
                        this.RBSheet3.close()
                        console.log("inside 3");
                        if (!this.state.File3) {
                            console.log("inside 3");
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForGradeCards: this.state.totalForGradeCards + 1 })
                            if (this.state.isThisThePdf) {
                                this.setState({ isPdf3: true })
                            } else {
                                this.setState({ isPdf3: false })
                            }
                        }
                        this.setState({ File3: source, })
                    } else if (nameOfFile === "File4") {
                        this.RBSheet4.close()
                        console.log("inside 4");
                        if (!this.state.File4) {
                            console.log("inside 4");
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForGradeCards: this.state.totalForGradeCards + 1 })
                            if (this.state.isThisThePdf) {
                                this.setState({ isPdf4: true })
                            } else {
                                this.setState({ isPdf4: false })
                            }
                        }
                        this.setState({ File4: source, })
                    } else if (nameOfFile === "File5") {
                        this.RBSheet5.close()
                        if (!this.state.File5) {
                            console.log("inside 5");
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForProvisionalDegree: this.state.totalForProvisionalDegree + 1 })
                        } if (this.state.isThisThePdf) {
                            this.setState({ isPdf5: true })
                        } else {
                            this.setState({ isPdf5: false })
                        }
                        this.setState({ File5: source, })
                    } else if (nameOfFile === "File6") {
                        this.RBSheet6.close()
                        console.log("inside 6");
                        if (!this.state.File6) {
                            console.log("inside 6");
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForProvisionalDegree: this.state.totalForProvisionalDegree + 1 })
                        }
                        if (this.state.isThisThePdf) {
                            this.setState({ isPdf6: true })
                        } else {
                            this.setState({ isPdf6: false })
                        }
                        this.setState({ File6: source, })
                    } else if (nameOfFile === "File7") {
                        this.RBSheet7.close()
                        console.log("inside 7");
                        if (!this.state.File7) {
                            console.log("inside 7");
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForOriginalDegree: this.state.totalForOriginalDegree + 1 })
                        }
                        if (this.state.isThisThePdf) {
                            this.setState({ isPdf7: true })
                        } else {
                            this.setState({ isPdf7: false })
                        }
                        this.setState({ File7: source, })
                    } else if (nameOfFile === "File8") {
                        this.RBSheet8.close()
                        console.log("inside 8");
                        if (!this.state.File8) {
                            console.log("inside 8");
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForOriginalDegree: this.state.totalForOriginalDegree + 1 })
                        }
                        if (this.state.isThisThePdf) {
                            this.setState({ isPdf8: true })
                        } else {
                            this.setState({ isPdf8: false })
                        }
                        this.setState({ File8: source, })
                    } else if (nameOfFile === "File9") {
                        this.RBSheet9.close()
                        if (!this.state.File9) {
                            console.log("inside 9");
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForMarksheet: this.state.totalForMarksheet + 1 })
                        }
                        if (this.state.isThisThePdf) {
                            this.setState({ isPdf9: true })
                        } else {
                            this.setState({ isPdf9: false })
                        }
                        this.setState({ File9: source, })
                    } else if (nameOfFile === "File10") {
                        this.RBSheet10.close()
                        if (!this.state.File10) {
                            console.log("inside 10");
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForMarksheet: this.state.totalForMarksheet + 1 })
                        }
                        if (this.state.isThisThePdf) {
                            this.setState({ isPdf10: true })
                        } else {
                            this.setState({ isPdf10: false })
                        }
                        console.log("inside 10 =-=-=-=-=");
                        console.log(source);

                        this.setState({ File10: source, })
                    } else if (nameOfFile === "File11") {
                        this.RBSheet11.close()
                        console.log("inside 11");
                        if (!this.state.File11) {
                            console.log("inside 11");
                            this.setState({ CountOfFiles: this.state.CountOfFiles + 1, totalForGradeCards: this.state.totalForGradeCards + 1 })
                        }
                        if (this.state.isThisThePdf) {
                            this.setState({ isPdf11: true })
                        } else {
                            this.setState({ isPdf11: false })
                        }
                        this.setState({ File11: source, })
                    }
                    this.setState({ gradeCardsAmount: this.state.totalForGradeCards * this.state.gradeCardAmount, provisionalDegreesAmount: this.state.totalForProvisionalDegree * this.state.provisionalDegreeAmount, originalDegreesAmount: this.state.totalForOriginalDegree * this.state.originalDegreeAmount, marksheetsForStudentsAmount: this.state.totalForMarksheet * this.state.marksheetAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount }))
                } else {
                    Alert.alert(
                        'Please select proper file format from below mentioned.',
                        'PNG, JPG, JPEG, PDF',
                        [
                            { text: 'OK', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                        ],
                        { cancelable: false }
                    );
                }
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
                this.setState({ isPdf: false })
            } else {
                throw err;
            }
        }
    }
    removeAttachedImage = (nameOfFile) => {
        if (nameOfFile === "File1") {
            console.log("inside 1");
            this.setState({ File1: "", CountOfFiles: this.state.CountOfFiles - 1, totalForGradeCards: this.state.totalForGradeCards - 1 }, () => this.setState({ gradeCardsAmount: this.state.totalForGradeCards * this.state.gradeCardAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        } else if (nameOfFile === "File2") {
            console.log("inside 2");
            this.setState({ File2: "", CountOfFiles: this.state.CountOfFiles - 1, totalForGradeCards: this.state.totalForGradeCards - 1 }, () => this.setState({ gradeCardsAmount: this.state.totalForGradeCards * this.state.gradeCardAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        } else if (nameOfFile === "File3") {
            console.log("inside 3");
            this.setState({ File3: "", CountOfFiles: this.state.CountOfFiles - 1, totalForGradeCards: this.state.totalForGradeCards - 1 }, () => this.setState({ gradeCardsAmount: this.state.totalForGradeCards * this.state.gradeCardAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        } else if (nameOfFile === "File4") {
            console.log("inside 4");
            this.setState({ File4: "", CountOfFiles: this.state.CountOfFiles - 1, totalForGradeCards: this.state.totalForGradeCards - 1 }, () => this.setState({ gradeCardsAmount: this.state.totalForGradeCards * this.state.gradeCardAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        } else if (nameOfFile === "File5") {
            console.log("inside 5");
            this.setState({ File5: "", CountOfFiles: this.state.CountOfFiles - 1, totalForProvisionalDegree: this.state.totalForProvisionalDegree - 1 }, () => this.setState({ provisionalDegreesAmount: this.state.totalForProvisionalDegree * this.state.provisionalDegreeAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        } else if (nameOfFile === "File6") {
            console.log("inside 6");
            this.setState({ File6: "", CountOfFiles: this.state.CountOfFiles - 1, totalForProvisionalDegree: this.state.totalForProvisionalDegree - 1 }, () => this.setState({ provisionalDegreesAmount: this.state.totalForProvisionalDegree * this.state.provisionalDegreeAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        } else if (nameOfFile === "File7") {
            console.log("inside 7");
            this.setState({ File7: "", CountOfFiles: this.state.CountOfFiles - 1, totalForOriginalDegree: this.state.totalForOriginalDegree - 1 }, () => this.setState({ originalDegreesAmount: this.state.totalForOriginalDegree * this.state.originalDegreeAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        } else if (nameOfFile === "File8") {
            console.log("inside 8");
            this.setState({ File8: "", CountOfFiles: this.state.CountOfFiles - 1, totalForOriginalDegree: this.state.totalForOriginalDegree - 1 }, () => this.setState({ originalDegreesAmount: this.state.totalForOriginalDegree * this.state.originalDegreeAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        } else if (nameOfFile === "File9") {
            console.log("inside 9");
            this.setState({ File9: "", CountOfFiles: this.state.CountOfFiles - 1, totalForMarksheet: this.state.totalForMarksheet - 1 }, () => this.setState({ marksheetsForStudentsAmount: this.state.totalForMarksheet * this.state.marksheetAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        } else if (nameOfFile === "File10") {
            console.log("inside 10");
            this.setState({ File10: "", CountOfFiles: this.state.CountOfFiles - 1, totalForMarksheet: this.state.totalForMarksheet - 1 }, () => this.setState({ marksheetsForStudentsAmount: this.state.totalForMarksheet * this.state.marksheetAmount }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        } else if (nameOfFile === "File11") {
            console.log("inside 11");
            this.setState({ File11: "", CountOfFiles: this.state.CountOfFiles - 1, totalForGradeCards: this.state.totalForGradeCards - 1 }, () => this.setState({ gradeCardsAmount: this.state.totalForGradeCards * this.state.gradeCardAmount, }, () => this.setState({ totalAmount: this.state.gradeCardsAmount + this.state.provisionalDegreesAmount + this.state.originalDegreesAmount + this.state.marksheetsForStudentsAmount })))
        }
    }
    _onPressButton = () => {
        console.log(this.state);
        console.log(this.state.File1, "++++++++++");
        console.log(this.state.avatarSource.uri, "++++++++++=====");
        const FileImg = this.state.avatarSource;
        if (!this.state.studentName) {
            this.setState({ studentNameError: "Name cannot be blank." })
            alert('Name cannot be blank.')
            return;
        } else if (!this.state.studentRegNo) {
            this.setState({ studentRegNoError: "Registration no cannot be blank." })
            alert('Registration no cannot be blank.')
            return;
        } else if (!this.state.institute) {
            alert('Please Select Institute.')
            return;
        } else if (!this.state.degree) {
            alert('Please Select Degree.')
            return;
        } else if (!this.state.branch) {
            alert('Please Select Branch.')
            return;
        } else if (!this.state.passoutYear) {
            alert('Please Select Passout Year.')
            return;
        } else if (!this.state.recruiterName) {
            this.setState({ recruiterNameError: "Recruiter name cannot be blank." })
            alert('Recruiter name cannot be blank.')
            return;
        } else if (!this.state.File1 && !this.state.File2 && !this.state.File3 && !this.state.File4 && !this.state.File11 && !this.state.File5 && !this.state.File6 && !this.state.File7 && !this.state.File8 && !this.state.File9 && !this.state.File10) {
            alert('Please upload atleast one document.')
            return;
        }
        this.setState({ loading: true })

        // this.setState({
        //     grade_card: [...this.state.grade_card, this.state.File1, this.state.File2, this.state.File3, this.state.File4, this.state.File11],
        //     provision_degree: [...this.state.provision_degree, this.state.File5, this.state.File6],
        //     original_degree: [...this.state.original_degree, this.state.File7, this.state.File8],
        //     marksheet: [...this.state.marksheet, this.state.File9, this.state.File10],
        // }, () => {
        const formData = new FormData();
        formData.append('type', 'submitRequest');
        if(Platform.OS == 'ios')
        {
            formData.append('device_type',"ios");
        }
        else{
            formData.append('device_type',"Android");
        }
        formData.append('device_type',Platform.OS);
        formData.append('user_id', this.props.user_id);
        formData.append('student_name', this.state.studentName);
        formData.append('student_institute', this.state.institute);
        formData.append('student_degree', this.state.degree);
        formData.append('student_branch', this.state.branch);
        formData.append('passout_year', this.state.passoutYear);
        formData.append('student_reg_no', this.state.studentRegNo);
        formData.append('total_files', this.state.CountOfFiles);
        formData.append('total_amount', this.state.totalAmount);
        formData.append('offer_letter', FileImg);
        console.log(this.state.File1, "File1-----");
        formData.append('grade_card[]', this.state.File1);
        formData.append('grade_card[]', this.state.File2);
        formData.append('grade_card[]', this.state.File3);
        formData.append('grade_card[]', this.state.File4);
        formData.append('grade_card[]', this.state.File11);
        formData.append('provision_degree[]', this.state.File5);
        formData.append('provision_degree[]', this.state.File6);
        formData.append('original_degree[]', this.state.File7);
        formData.append('original_degree[]', this.state.File8);
        formData.append('marksheet[]', this.state.File9);
        formData.append('marksheet[]', this.state.File10);
        formData.append('name_of_recruiter', this.state.recruiterName)
        formData.append('user_type', this.props.userType);
        formData.append('institute', this.props.changedInstituteName);

        console.log("=-=-=-=-=");
        console.log(formData);


        fetch(`${URL}request-verification`, {
            method: 'POST',
            headers: {
                'Accept': 'application\/json',
                'Content-Type': 'multipart\/form-data',
                'apikey': APIKEY,
                'accesstoken': this.props.accessToken
            },
            body: formData,
        }).then(res => res.json())
            // }).then(res => res.text())
            .then(response => {
                console.log("request-verification response",response);

                this.setState({ loading: false })
                // console.log(response);
                if (response.status == 200) {
                    this.setState({ requestParameter: response.request_number, 
                        pay_url : response.url,
                        showHide: true }, () => this.paymentApi())
                } else if (response.status == 409) { utilities.showToastMsg(response.message); }
                else if (response.status == 422) { utilities.showToastMsg(response.message); }
                else if (response.status == 400) { utilities.showToastMsg(response.message); }
                else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
                else if (response.status == 405) { utilities.showToastMsg(response.message); }
            })
            .catch(error => {
                this.setState({ loading: false })
                console.log(error);
            });
        // })
    }
    handleWebViewNavigationStateChange = (newNavState) => {
        console.log("=-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-==-==-=-=-=-=-=");
        console.log(newNavState);
        // if (newNavState.canGoBack) {
        //     this.setState({ showHideBangdu: false })
        //     this.props.navigation.navigate("VerifierMainScreen")
        // }
    }
    paymentApi = () => {
        this.setState({ showHideBangdu: true })
        // console.log("-=-=-=>>>>>>><<<<<<<<>>>>>>>>><<<<<<<<<=-==-=-=-=-=-=-=-=-=");
        // console.log(`https://raisoni.seqronline.com/verify/functions/payment_paytm/paytm.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}&institute=${this.state.institute}&user_type=${this.props.userType}`);

        // setTimeout(() => {
        //     // const url = `http://192.168.0.5:808/raisoni/verify/functions/payment/payubiz.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}&institute=${this.props.changedInstituteName}&user_type=${this.props.userType}`
        //     // const url = `https://raisoni.seqronline.com/verify/functions/payment_paytm/paytm.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}&institute=${this.state.institute}&user_type=${this.props.userType}`
        //     const url = `https://raisoni.seqronline.com/verify/functions/payment_paytm/paytm.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}&institute=${this.state.institute}&user_type=${this.props.userType}`
        //     InAppBrowser.open(url, {
        //         headers: {
        //             'Content-Type': 'multipart\/form-data',
        //             'apikey': APIKEY,
        //             'accesstoken': this.props.accessToken
        //         },
        //         // iOS Properties
        //         dismissButtonStyle: 'cancel',
        //         preferredBarTintColor: '#453AA4',

        //         // Android Properties
        //         showTitle: true,
        //         toolbarColor: '#6200EE',
        //         secondaryToolbarColor: 'black',
        //         // enableUrlBarHiding: true,
        //         // enableDefaultShare: true,
        //         // forceCloseOnRedirection: true,
        //     }).then((result) => {
        //         console.log("==-popopopo-=-=-=-");
        //         console.log(result)
        //         if (result.type === "cancel") {
        //             this.props.navigation.navigate('VerifierMainScreen')
        //         }
        //     })
        // }, 500);
    }
    _callForLogoutAPI = () => {
        const formData = new FormData();
        formData.append('type', 'logout');
        formData.append('user_id', this.props.user_id);
        formData.append('institute', this.props.changedInstituteName);
        formData.append('user_type', this.props.userType);
        console.log(formData);
        fetch(`${URL}login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart\/form-data',
                'Accept': 'application/json',
                'apikey': APIKEY,
                'accesstoken': this.props.accessToken
            },
            body: formData,
        }).then(res => res.json())
            .then(response => {
                this.setState({ loading: false })
                console.log("logout response",response);
                if (response.status == 200) {
                    utilities.showToastMsg(response.message);
                    this.props.navigation.navigate('HomeScreen');
                    setTimeout(() => {
                        this.props.clearStore('clearData')
                        AsyncStorage.clear();
                    }, 800);
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
    }
    parentMethod(data) {
        this.setState({
            gradeCardAmount: data.gradeCardAmount, provisionalDegreeAmount: data.provisionalDegreeAmount,
            originalDegreeAmount: data.originalDegreeAmount, marksheetAmount: data.marksheetAmount
        })
    }
    recuriterDataChange = recruiterName => {
        this.setState({ recruiterName: recruiterName, recruiterNameError: '' })
    }
    getDocumentPrices = (institute) => {
        this.setState({ loading: true })
        const formData = new FormData();
       formData.append('institute', institute);
        console.log("getDocumentPrices formdata",formData);

        fetch(`${URL}document-prices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart\/form-data',
                'apikey': APIKEY,
                'accesstoken': this.props.accessToken
            },
            body: formData,
        }).then(res => res.json())
            .then(response => {
                this.setState({ loading: false })
                console.log("document prices response",response);
                if (response.status == 200) {
                    console.log("document-prices response",response.dataPrice[1][1]);
                    this.setState({
                        tableData: response.dataPrice, tableHead: response.dataHeading,
                        // gradeCardAmount: response.dataPrice[0][1].split(' ')[0], 
                        provisionalDegreeAmount: response.dataPrice[0][1].split(' ')[0],
                        // originalDegreeAmount: response.dataPrice[1][1].split(' ')[0], 
                        marksheetAmount: response.dataPrice[1][1].split(' ')[0]
                    })
                }
                // else if (response.status == 409) { utilities.showToastMsg(response.message); }
                // else if (response.status == 422) { utilities.showToastMsg(response.message); }
                // else if (response.status == 400) { utilities.showToastMsg(response.message); }
                else if (response.status == 403) {
                    utilities.showToastMsg(response.message);
                    this.props.navigation.navigate('VerifierLoginScreen')
                }
                else if (response.status == 405) { utilities.showToastMsg(response.message); }
            })
            .catch(error => {
                this.setState({ loading: false })
                console.log(error);
            });
    }
    render() {
        // console.log("payurl", this.state.pay_url);
        return (
            <View style={{ flex: 1 }}>
                <StatusBar backgroundColor="#0000FF" />
                {!this.state.showHideBangdu ?
                    <View style={{ flex: 1 }}>
                        {this._showHeader()}
                        <Loader loading={this.state.loading} text={this.state.loaderText} />
                        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps={'handled'}>
                            <Card style={styles.cardContainer}>
                                <View style={{ marginTop: 0, paddingTop: 0 }}>
                                    {!!this.state.studentNameError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    placeholder='Student Name'
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentNameError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.studentNameError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel>
                                            <Label style={{ color: 'grey' }}>Student Name</Label>
                                            <Input
                                                value={this.state.studentName}
                                                disabled={this.state.disableTheFields}
                                                autoFocus={true}
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(studentName) => this.setState({ studentName: studentName })}
                                                style={{ color: this.state.disableTheFields ? '#999999' : 'black' }}
                                            />
                                        </Item>
                                    }

                                    {!!this.state.studentRegNoError ? (
                                        <Form>
                                            <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                <Input
                                                    placeholder='Student Institute Registration Number / Enrollment Number*'
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentRegNoError: null }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                />
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                            </Item>
                                            <Text style={styles.errorMsg}>{this.state.studentRegNoError}</Text>
                                        </Form>
                                    ) :
                                        <Item floatingLabel style={{ marginTop: 10 }}>
                                            <Label style={{ color: 'grey' }}>Student Institute Registration Number / Enrollment Number</Label>
                                            <Input
                                                value={this.state.studentRegNo}
                                                disabled={this.state.disableTheFields}
                                                maxLength={20}
                                                onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                onChangeText={(studentRegNo) => this.setState({ studentRegNo: studentRegNo })}
                                                style={{ color: this.state.disableTheFields ? '#999999' : 'black', marginTop: 40 }}
                                            />
                                        </Item>
                                    }

                                    <View style={{ marginLeft: 10, marginRight: 10 }}>
                                        <Dropdown
                                            value={this.state.institute}
                                            disabled={this.state.disableTheFields}
                                            label='Institute'
                                            data={this.state.instituteList}
                                            onChangeText={(institute) => this.setState({ institute: institute }, () => {
                                                this.props.changeNameForInstituteRequestForm(this.state.institute), this.getDocumentPrices(institute), this.setState({
                                                    avatarSource: '',
                                                    File1: '',
                                                    File2: '',
                                                    File3: '',
                                                    File4: '',
                                                    File5: '',
                                                    File6: '',
                                                    File7: '',
                                                    File8: '',
                                                    File9: '',
                                                    File10: '',
                                                    File11: '',
                                                    CountOfFiles: 0,
                                                    totalForGradeCards: 0,
                                                    gradeCardsAmount: 0,
                                                    totalForProvisionalDegree: 0,
                                                    provisionalDegreesAmount: 0,
                                                    totalForOriginalDegree: 0,
                                                    originalDegreesAmount: 0,
                                                    totalForMarksheet: 0,
                                                    marksheetsForStudentsAmount: 0,
                                                    totalAmount: 0,
                                                    grade_card: [],
                                                    provision_degree: [],
                                                    original_degree: [],
                                                    marksheet: [],
                                                    showHide: false,
                                                    requestParameter: '',
                                                    disableTheFields: false,
                                                    isPdf: false,
                                                    isPdf1: false,
                                                    isPdf2: false,
                                                    isPdf3: false,
                                                    isPdf4: false,
                                                    isPdf5: false,
                                                    isPdf6: false,
                                                    isPdf7: false,
                                                    isPdf8: false,
                                                    isPdf9: false,
                                                    isPdf10: false,
                                                    isPdf11: false,
                                                    isThisThePdf: false,
                                                    gradeCardAmount: '',
                                                    provisionalDegreeAmount: '',
                                                    originalDegreeAmount: '',
                                                    marksheetAmount: '',
                                                    tableHead: [],
                                                    tableData: [],
                                                    gradeCardAmount: '',
                                                    provisionalDegreeAmount: '',
                                                    originalDegreeAmount: '',
                                                    marksheetAmount: ''
                                                })
                                            })}
                                        />
                                    </View>
                                    <View style={{ marginLeft: 10, marginRight: 10 }}>
                                        <Dropdown
                                            value={this.state.degreeName}
                                            disabled={this.state.disableTheFields}
                                            label='Degree'
                                            data={this.state.degreeList}
                                            onChangeText={(degree) => this.selectDegreeID(degree, this.state.degreeList)}
                                        />
                                    </View>
                                    <View style={{ marginLeft: 10, marginRight: 10 }}>
                                        <Dropdown
                                            value={this.state.branchName}
                                            disabled={this.state.disableTheFields}
                                            label='Branch'
                                            data={this.state.branchList.length > 0 ? this.state.branchList : []}
                                            onChangeText={(branch) => this.settingBranch(branch, this.state.branchList)}
                                        />
                                    </View>

                                    <View style={{ marginLeft: 10, marginRight: 10 }}>
                                        <Dropdown
                                            value={this.state.passoutYear}
                                            disabled={this.state.disableTheFields}
                                            label='Passout Year'
                                            data={this.state.passoutYearList.length > 0 ? this.state.passoutYearList : []}
                                            onChangeText={(passoutYear) => this.setYear(passoutYear)}
                                        />
                                    </View>

                                    <View style={{ marginTop: 10 }}>
                                        <Text style={{ color: 'grey' }}>Upload Offer Letter/Joining Letter :</Text>
                                    </View>

                                    <Grid style={{ marginTop: 10 }}>
                                        <Col>
                                            {!this.state.avatarSource ? <View style={{ alignItems: 'center' }}>
                                                {/* <TouchableOpacity onPress={this.openImageGallery}> */}
                                                <TouchableOpacity onPress={() => { this.RBSheet.open() }}>
                                                    <View style={{ marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C', width: 150 }}>
                                                        <Text style={{ padding: 10, color: '#fcb52f', }}>Browse</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                                :
                                                <View style={{ alignItems: 'center', }}>
                                                    {this.state.isPdf ?
                                                        // <Icon type="FontAwesome" onPress={() => this.setState({ avatarSource: '' })} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 110 }} />
                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ height: 100, width: 100, borderWidth: 0, borderColor: 'black', tintColor: '#0000FF' }} />
                                                        :
                                                        <Image source={{ uri: this.state.avatarSource.uri }} style={{ height: 130, width: 100, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                    }
                                                    <Icon type="FontAwesome" onPress={() => this.setState({ avatarSource: '' })} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute' }} />
                                                </View>
                                            }
                                            {/* {this.state.avatarSource ? <Content padder>
                                    <TouchableOpacity onPress={() => this.setState({ avatarSource: '' })}>
                                        <View style={{ alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                            <Text style={{ padding: 10, color: '#fcb52f', }}>Remove</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Content>
                                    : <View></View>} */}
                                        </Col>
                                    </Grid>




                                    {!!this.state.recruiterNameError ? (
                                        <View style={{ marginTop: 15 }}>
                                            <Label style={{ color: 'black' }}>Name of Recruiter :</Label>
                                            <TextInput
                                                style={{ height: 40, borderColor: 'red', borderWidth: 1, marginTop: 2 }}
                                                maxLength={100}
                                                onChangeText={(recruiterName) => this.recuriterDataChange(recruiterName)}
                                            />
                                            <View style={{ justifyContent: 'center' }}>
                                                <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 18, color: 'red', marginTop: 5 }}>
                                                    {' '}<Text style={styles.errorMsg}>{this.state.recruiterNameError}</Text>
                                                </Icon>
                                            </View>
                                        </View>
                                        // <Form>
                                        //     <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                        //         <Input
                                        //             placeholder='Student Institute Registration No'
                                        //             onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ recruiterNameError: null }) }}
                                        //             onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                        //         />
                                        //         <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                        //     </Item>
                                        //     <Text style={styles.errorMsg}>{this.state.recruiterNameError}</Text>
                                        // </Form>
                                    ) :
                                        <View style={{ marginTop: 15 }}>
                                            <Label style={{ color: 'black' }}>Name of Recruiter :</Label>
                                            <TextInput
                                                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 2, color: this.state.disableTheFields ? '#999999' : 'black'  }}
                                                // style={{ color: this.state.disableTheFields ? '#999999' : 'black' }}
                                                maxLength={100}
                                                onChangeText={(recruiterName) => this.recuriterDataChange(recruiterName)}
                                            />
                                        </View>
                                    }
                                    <View style={{ marginTop: 15 }}>
                                        <Text style={{ color: 'grey' }}>Prices For Verification :</Text>
                                    </View>

                                    <PricesTable accessToken={this.props.accessToken} tableHead={this.state.tableHead} tableData={this.state.tableData} parentReference={this.parentMethod.bind(this)} />

                                    {/* {this.state.tableData.length > 0 ?
                            <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}>
                                <Row data={this.state.tableHead} style={styles.head} textStyle={styles.text} />
                                <Rows data={this.state.tableData} textStyle={styles.text} />
                            </Table>
                            : <Text style={{ textAlign: 'center', color: 'red' }}>Please select institute</Text>} */}

                                    <View style={{ marginTop: 10, bottom: 10 }}>
                                        <Text style={{ color: 'grey' }}>Upload Documents :</Text>
                                    </View>
                                    <Grid>
                                        <Card style={{ width: '100%' }}>
                                            <Col>
                                                <Text style={{ marginLeft: 5 }}>Grade Card</Text>
                                            </Col>
                                            <Col>
                                                <Content padder>
                                                    <Row>
                                                        <Col style={{ marginRight: 10 }}>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File1')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet1.open() }}>
                                                                {!this.state.File1 ?
                                                                    <View style={{ justifyContent: 'center', height: 80, marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', textAlign: 'center' }}>File 1</Text>
                                                                    </View>
                                                                    : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File1 ?
                                                                <View>
                                                                    {this.state.isPdf1 ?
                                                                        // <Icon type="FontAwesome" name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10 }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File1.uri }} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File1') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}
                                                        </Col>
                                                        <Col style={{ marginRight: 10 }}>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File2')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet2.open() }}>
                                                                {!this.state.File2 ?
                                                                    <View style={{ justifyContent: 'center', height: 80, marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', textAlign: 'center' }}>File 2</Text>
                                                                    </View> : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File2 ?
                                                                <View>
                                                                    {this.state.isPdf2 ?
                                                                        // <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File2') }} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10 }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File2.uri }} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File2') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}

                                                        </Col>
                                                        <Col style={{ marginRight: 10 }}>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File3')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet3.open() }}>
                                                                {!this.state.File3 ?
                                                                    <View style={{ justifyContent: 'center', height: 80, marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', textAlign: 'center' }}>File 3</Text>
                                                                    </View> : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File3 ?
                                                                <View>
                                                                    {this.state.isPdf3 ?
                                                                        // <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File3') }} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10 }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File3.uri }} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File3') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}
                                                        </Col>
                                                        <Col style={{ marginRight: 10 }}>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File4')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet4.open() }}>
                                                                {!this.state.File4 ?
                                                                    <View style={{ justifyContent: 'center', height: 80, marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', textAlign: 'center' }}>File 4</Text>
                                                                    </View> : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File4 ?
                                                                <View>
                                                                    {this.state.isPdf4 ?
                                                                        // <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File4') }} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10 }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File4.uri }} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File4') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}
                                                        </Col>
                                                        <Col>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File11')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet11.open() }}>
                                                                {!this.state.File11 ?
                                                                    <View style={{ justifyContent: 'center', height: 80, marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', textAlign: 'center' }}>File 5</Text>
                                                                    </View> : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File11 ?
                                                                <View>
                                                                    {this.state.isPdf11 ?
                                                                        // <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File11') }} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10 }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File11.uri }} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File11') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}
                                                        </Col>
                                                    </Row>
                                                </Content>
                                            </Col>
                                        </Card>
                                    </Grid>
                                    <Grid>
                                        <Card style={{ width: '100%' }}>
                                            <Col>
                                                <Text style={{ marginLeft: 5 }}>Provisional Degree</Text>
                                            </Col>
                                            <Col>
                                                <Row>
                                                    <Col>
                                                        <Content padder>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File5')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet5.open() }}>
                                                                {!this.state.File5 ?
                                                                    <View style={{ marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', }}>File 1</Text>
                                                                    </View> : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File5 ?
                                                                <View>
                                                                    {this.state.isPdf5 ?
                                                                        // <Icon type="FontAwesome" onPress={() => this.setState({ avatarSource: '' })} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10, alignSelf: 'center' }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File5.uri }} style={{ alignSelf: 'center', marginTop: 10, height: 80, width: 80, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File5') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}
                                                        </Content>
                                                    </Col>
                                                    <Col>
                                                        <Content padder>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File6')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet6.open() }}>
                                                                {!this.state.File6 ?
                                                                    <View style={{ marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', }}>File 2</Text>
                                                                    </View> : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File6 ?
                                                                <View>
                                                                    {this.state.isPdf6 ?
                                                                        // <Icon type="FontAwesome" onPress={() => this.setState({ avatarSource: '' })} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10, alignSelf: 'center' }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File6.uri }} style={{ alignSelf: 'center', marginTop: 10, height: 80, width: 80, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File6') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}
                                                        </Content>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Card>
                                    </Grid>
                                    <Grid>
                                        <Card style={{ width: '100%' }}>
                                            <Col>
                                                <Text style={{ marginLeft: 5 }}>Leaving Certificate</Text>
                                            </Col>
                                            <Col>
                                                <Row>
                                                    <Col>
                                                        <Content padder>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File7')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet7.open() }}>
                                                                {!this.state.File7 ?
                                                                    <View style={{ marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', }}>File 1</Text>
                                                                    </View> : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File7 ?
                                                                <View>
                                                                    {this.state.isPdf7 ?
                                                                        // <Icon type="FontAwesome" onPress={() => this.setState({ avatarSource: '' })} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10, alignSelf: 'center' }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File7.uri }} style={{ alignSelf: 'center', marginTop: 10, height: 80, width: 80, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File7') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}
                                                        </Content>
                                                    </Col>
                                                    <Col>
                                                        <Content padder>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File8')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet8.open() }}>
                                                                {!this.state.File8 ?
                                                                    <View style={{ marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', }}>File 2</Text>
                                                                    </View> : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File8 ?
                                                                <View>
                                                                    {this.state.isPdf8 ?
                                                                        // <Icon type="FontAwesome" onPress={() => this.setState({ avatarSource: '' })} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10, alignSelf: 'center' }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File8.uri }} style={{ alignSelf: 'center', marginTop: 10, height: 80, width: 80, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File8') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}
                                                        </Content>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Card>
                                    </Grid>
                                    <Grid>
                                        <Card style={{ width: '100%' }}>
                                            <Col>
                                                <Text style={{ marginLeft: 5 }}>Marksheet RTMNU Students(Non-Autonomous)</Text>
                                            </Col>
                                            <Col>
                                                <Row>
                                                    <Col>
                                                        <Content padder>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File9')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet9.open() }}>
                                                                {!this.state.File9 ?
                                                                    <View style={{ marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', }}>File 1</Text>
                                                                    </View> : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File9 ?
                                                                <View>
                                                                    {this.state.isPdf9 ?
                                                                        // <Icon type="FontAwesome" onPress={() => this.setState({ avatarSource: '' })} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10, alignSelf: 'center' }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File9.uri }} style={{ alignSelf: 'center', marginTop: 10, height: 80, width: 80, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File9') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}
                                                        </Content>
                                                    </Col>
                                                    <Col>
                                                        <Content padder>
                                                            {/* <TouchableOpacity onPress={() => this.openImageGalleryForUploads('File10')}> */}
                                                            <TouchableOpacity onPress={() => { this.RBSheet10.open() }}>
                                                                {!this.state.File10 ?
                                                                    <View style={{ marginTop: 10, alignItems: 'center', borderWidth: 1, borderRadius: 5, borderColor: '#94302C' }}>
                                                                        <Text style={{ padding: 10, color: '#fcb52f', }}>File 2</Text>
                                                                    </View> : <View></View>}
                                                            </TouchableOpacity>
                                                            {this.state.File10 ?
                                                                <View>
                                                                    {this.state.isPdf10 ?
                                                                        // <Icon type="FontAwesome" onPress={() => this.setState({ avatarSource: '' })} name="file-pdf-o" style={{ color: '#0000FF', fontSize: 70, marginTop: 10, alignSelf: 'center' }} />
                                                                        <Image source={require('../../../images/pdfIcon.png')} style={{ marginTop: 10, height: 80, width: 60, borderWidth: 1, borderColor: 'black', tintColor: '#0000FF' }} />
                                                                        :
                                                                        <Image source={{ uri: this.state.File10.uri }} style={{ alignSelf: 'center', marginTop: 10, height: 80, width: 80, borderWidth: 1, borderColor: 'black' }} resizeMode={ImageResizeMode.center} />
                                                                    }
                                                                    <Icon type="FontAwesome" onPress={() => { this.removeAttachedImage('File10') }} name="times" style={{ fontSize: 25, color: 'red', position: 'absolute', alignSelf: 'flex-end' }} />
                                                                </View>
                                                                : <View></View>}
                                                        </Content>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Card>
                                    </Grid>

                                    <Card style={{ width: '100%', padding: 10 }}>
                                        <Grid>
                                            {/* <Row>
                                    <Col size={8}>
                                        <Text style={{ fontWeight: 'bold' }}>Total files uploaded</Text>
                                    </Col>
                                    <Col size={4}>
                                        <Text>:   {this.state.CountOfFiles}</Text>
                                    </Col>
                                </Row> */}
                                            <Row>
                                                <Col size={8}>
                                                    <Text style={{ fontWeight: 'bold' }}>Total Grade Card</Text>
                                                </Col>
                                                <Col size={4}>
                                                    <Text>:   {this.state.totalForGradeCards}  -   <Icon type="FontAwesome" name="inr" style={{ fontSize: 14, fontweight: 'bold' }} /> {this.state.gradeCardsAmount}</Text>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col size={8}>
                                                    <Text style={{ fontWeight: 'bold' }}>Total Provisional Degree</Text>
                                                </Col>
                                                <Col size={4}>
                                                    <Text>:   {this.state.totalForProvisionalDegree}  -   <Icon type="FontAwesome" name="inr" style={{ fontSize: 14, fontweight: 'bold' }} /> {this.state.provisionalDegreesAmount}</Text>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col size={8}>
                                                    <Text style={{ fontWeight: 'bold' }}>Total Leaving Certificate</Text>
                                                </Col>
                                                <Col size={4}>
                                                    <Text>:   {this.state.totalForOriginalDegree}  -   <Icon type="FontAwesome" name="inr" style={{ fontSize: 14, fontweight: 'bold' }} /> {this.state.originalDegreesAmount}</Text>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col size={8}>
                                                    <Text style={{ fontWeight: 'bold' }}>Total Marksheet RTMNU Students</Text>
                                                </Col>
                                                <Col size={4}>
                                                    <Text>:   {this.state.totalForMarksheet}  -   <Icon type="FontAwesome" name="inr" style={{ fontSize: 14, fontweight: 'bold' }} /> {this.state.marksheetsForStudentsAmount}</Text>
                                                </Col>
                                            </Row>
                                        </Grid>
                                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#f4b826', marginTop: 0, margin: 0, marginTop: 3 }} />
                                        <Grid>
                                            <Row>
                                                <Col size={8}>
                                                    <Text style={{ fontWeight: 'bold' }}>Total Amount</Text>
                                                </Col>
                                                <Col size={4}>
                                                    <Text>:   <Icon type="FontAwesome" name="inr" style={{ fontSize: 14, fontweight: 'bold' }} /> {this.state.totalAmount}</Text>
                                                </Col>
                                            </Row>
                                        </Grid>
                                    </Card>
                                    <Content padder>
                                        <TouchableOpacity onPress={() => this._onPressButton()}>
                                            <View style={styles.buttonSignUp}>
                                                <Text style={styles.buttonTextSignUp}>Make Payment To Submit</Text>
                                            </View>
                                        </TouchableOpacity>

                                    </Content>
                                </View>

                                <RBSheet ref={ref => { this.RBSheet = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGallery('image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGallery('pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>

                                <RBSheet ref={ref => { this.RBSheet1 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet1.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File1', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File1', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                                <RBSheet ref={ref => { this.RBSheet2 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet2.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File2', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File2', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                                <RBSheet ref={ref => { this.RBSheet3 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet3.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File3', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File3', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                                <RBSheet ref={ref => { this.RBSheet4 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet4.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File4', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File4', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                                <RBSheet ref={ref => { this.RBSheet5 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet5.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File5', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File5', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                                <RBSheet ref={ref => { this.RBSheet6 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet6.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File6', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File6', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                                <RBSheet ref={ref => { this.RBSheet7 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet7.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File7', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File7', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                                <RBSheet ref={ref => { this.RBSheet8 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet8.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File8', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File8', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                                <RBSheet ref={ref => { this.RBSheet9 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet9.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File9', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File9', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                                <RBSheet ref={ref => { this.RBSheet10 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet10.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File10', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File10', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                                <RBSheet ref={ref => { this.RBSheet11 = ref; }} height={150} duration={5} animationType="fade">
                                    <Grid>
                                        <Row size={2} style={{ justifyContent: 'flex-end' }}>
                                            <Icon type="FontAwesome" onPress={() => { this.RBSheet11.close() }} name="times" style={{ fontSize: 25, color: 'red', alignSelf: 'flex-end', marginRight: 20 }} />
                                        </Row>
                                        <Row size={10} style={{ marginTop: 5 }}>
                                            <Col onPress={() => this.openImageGalleryForUploads('File11', 'image')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/images.jpeg')} style={{ height: 90, width: 90, }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Image</Text>
                                                </Row>
                                            </Col>
                                            <Col onPress={() => this.openImageGalleryForUploads('File11', 'pdf')}>
                                                <Row size={9} style={{ justifyContent: 'center', }}>
                                                    <Image source={require('../../../images/adobe-pdf-icon.png')} style={{ height: 70, width: 70 }} resizeMode='center' />
                                                </Row>
                                                <Row size={3} style={{ justifyContent: 'center', marginTop: 5 }}>
                                                    <Text style={{ fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>Upload Pdf</Text>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </RBSheet>
                            </Card>
                        </ScrollView>
                    </View>
                    :
                    <WebView source={{
                        // uri: `http://192.168.0.5:808/raisoni/verify/functions/payment/payubiz.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}&institute=${this.props.changedInstituteName}&user_type=${this.props.userType}`,
                        // uri: `https://raisoni.seqronline.com/verify/functions/payment_paytm/paytm.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}&institute=${this.state.institute}&user_type=${this.props.userType}`,
                        // uri: `https://raisoni.seqronline.com/verify/functions/payment_paytm/paytm.php?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}`,
                        uri: encodeURI(`${this.state.pay_url}?UID=${this.props.user_id}&payment_from=mobile&key_payment=${this.state.requestParameter}`),
                        // uri: `https://demo.seqrdoc.com/verify/payment/paytm?key_payment=OCV-R-787`, 
                        headers: {
                            'Content-Type': 'multipart\/form-data',
                            'apikey': APIKEY,
                            'accesstoken': this.props.accessToken
                        }
                    }}
                        onNavigationStateChange={this.handleWebViewNavigationStateChange}
                        renderLoading={() => (
                            <ActivityIndicator
                              color='black'
                              size='large'
                              style={{ flex: 1 }}
                            />
                          )}
                          onMessage={event => {
                           // this.callApiForPayment(this.state.key);
                          
                            this.props.navigation.navigate('VerifierMainScreen');
                            this.setState({ showHideBangdu: false })
                          }}
                    />
                }
            </View>
        )
    }
}
const styles = StyleSheet.create({
    signUpViewContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingTop: 5
    },
    cardContainer: {
        padding: 15,
        marginTop: 20,
        marginLeft: 15,
        marginRight: 15
    },
    buttonSignUp: {
        marginTop: 10,
        alignItems: 'center',
        backgroundColor: '#94302C',
        borderRadius: 5
    },
    buttonTextSignUp: {
        padding: 10,
        color: '#fcb52f',
    },
    errorMsg: {
        // marginLeft: 18,
        fontSize: 12,
        color: 'red',
    },
    container: { flex: 1, padding: 16, paddingTop: 10, backgroundColor: '#fff' },
    head: { height: 50, backgroundColor: '#f1f8ff' },
    text: { margin: 6, textAlign: 'center' },
})
const mapStateToProps = (state) => {
    console.log("Request verification",state);
    return {
        accessToken: state.VerifierReducer.LoginData.access_token,
        user_id: state.VerifierReducer.LoginData.id,
        full_name: state.VerifierReducer.LoginData.fullname,
        user_type: state.VerifierReducer.LoginData.user_type,
        email_id: state.VerifierReducer.LoginData.email_id,
        mobile_no: state.VerifierReducer.LoginData.mobile_no,
        isUserStudent: state.VerifierReducer.LoginData.user_type,
        changedInstituteName: state.VerifierReducer.changedInstituteName,
        userType: state.VerifierReducer.LoginData.user_type
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ clearStore: clearTheStoreOnLogout, changeNameForInstituteRequestForm: changeNameForInstituteRequestForm }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(RequestVerification)