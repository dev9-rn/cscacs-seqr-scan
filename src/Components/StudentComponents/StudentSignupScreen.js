import React, { Component } from 'react';
import { StatusBar, BackHandler, Platform, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header, Left, Body, Content, Card, CardItem, Text, Title, Item, Label, Input, Icon, Form } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Loader from '../../Utilities/Loader';
import * as utilities from '../../Utilities/utilities';
import { changeNameForInstitute } from '../../Redux/Actions/VerifierActions';
import { connect } from 'react-redux';
import { Col, Grid } from "react-native-easy-grid";
import { Dropdown } from 'react-native-material-dropdown';
import { URL, APIKEY } from '../../../App';
import { bindActionCreators } from 'redux';
var _ = require('lodash');

class StudentSignupScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isConnected: true,
            name: '',
            email: '',
            phoneNumber: '',
            borderBottomColorPassword: '#757575',
            borderBottomColorUserName: '#757575',
            loading: false,
            loaderText: 'Signing you up...',
            nameError: null,
            emailError: null,
            phoneNumberError: null,
            userNameError: null,
            btnOTP: 'active',
            btnEmail: 'inactive',
            employer: true,
            thirdPartyAgency: false,
            student: true,
            employer_reg_no: '',
            employer_reg_noError: "",
            addressError: '',
            address: '',
            workingSector: '',
            agencyName: '',
            agencyNameError: '',
            agency_reg_no: '',
            agency_reg_noError: "",
            agencyWorkingSector: '',
            agencyWorkingSectorError: '',
            agencyAddress: '',
            agencyAddressError: '',
            agencyMobileNo: '',
            agencyMobileNoError: '',
            agencyEmailId: '',
            agencyEmailIdError: '',
            studentFirstName: '',
            studentFirstNameError: '',
            studentLastName: '',
            studentLastNameError: '',
            institute: '',
            instituteList: [],
            instituteError: '',
            degree: '',
            degreeList: [],
            degreeError: '',
            branchList: [],
            branch: '',
            branchError: '',
            passoutYear: '',
            passoutYearList: [],
            passoutYearError: '',
            studentRegNo: '',
            studentRegNoError: '',
            studentMobileNo: '',
            studentMobileNoError: '',
            studentEmailId: '',
            studentEmailIdError: '',
            studentAddress: '',
            studentAddressError: '',
            degreeID: '',
            bracnhID: ''
        };
    }
    componentDidMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackPress), this.degreeApi(), this.instituteApi(), this.getYearsList() }
    componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress) }
    handleBackPress = () => { this.props.navigation.navigate('StudentLoginScreen'); return true; }
    getYearsList = () => {
        var currentYear = new Date().getFullYear(),
            startYear = 2000;
        for (var i = startYear; i <= currentYear; i++) {
            var obj = {}
            obj.value = i
            this.state.passoutYearList.push(obj)
        }
    }
    _validateEmail() {
        let lEmail = this.state.email;
        let res = utilities.checkEmail(lEmail);
        if (!res) { this.setState({ emailError: "This email address is invalid" }); }
        return res;
    }
    _validateMobileNumber() {
        let lPhoneNumber = this.state.phoneNumber;
        let res = '';
        res = utilities.checkMobileNumber(lPhoneNumber);
        if (!res || lPhoneNumber.trim().length < 10) { this.setState({ phoneNumberError: "This phone number appears to be invalid." }); }
        return res;
    }
    _validateEmail1() {
        let lEmail = this.state.agencyEmailId;
        let res = utilities.checkEmail(lEmail);
        if (!res) { this.setState({ agencyEmailIdError: "This email address is invalid" }); }
        return res;
    }
    _validateMobileNumber1() {
        let lPhoneNumber = this.state.agencyMobileNo;
        let res = '';
        res = utilities.checkMobileNumber(lPhoneNumber);
        if (!res || lPhoneNumber.trim().length < 10) { this.setState({ agencyMobileNoError: "This phone number appears to be invalid." }); }
        return res;
    }
    _validateEmail2() {
        let lEmail = this.state.studentEmailId;
        let res = utilities.checkEmail(lEmail);
        if (!res) { this.setState({ studentEmailIdError: "This email address is invalid" }); }
        return res;
    }
    _validateMobileNumber2() {
        let lPhoneNumber = this.state.studentMobileNo;
        let res = '';
        res = utilities.checkMobileNumber(lPhoneNumber);
        if (!res || lPhoneNumber.trim().length < 10) { this.setState({ studentMobileNoError: "This phone number appears to be invalid." }); }
        return res;
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
            },
            body: formData,
        }).then(res => res.json())
            .then(response => {
                this.setState({ loading: false })
                console.log(response);
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
            },
            body: formData,
        }).then(res => res.json())
            .then(response => {
                this.setState({ loading: false })
                console.log(response);
                if (response.status == 200) {
                    this.setState({ branchList: response.data })
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
    _onPressButton(condition) {
        this.setState({
            agencyNameError: '',
            agencyEmailIdError: '',
            agencyMobileNoError: '',
            agency_reg_noError: '',
            agencyAddressError: '',
            nameError: '',
            emailError: '',
            phoneNumberError: '',
            employer_reg_noError: '',
            addressError: ''
        })
        if (this.state.studentFirstName === "") {
            this.setState({ studentFirstNameError: "First Name is required." });
            utilities.showToastMsg("First Name is required.")
            return;
        } else {
            this.setState({ studentFirstNameError: null });
        }
        if (this.state.studentLastName === "") {
            this.setState({ studentLastNameError: "Last Name is required." });
            utilities.showToastMsg("Last Name is required.")
            return;
        } else {
            this.setState({ studentLastNameError: null });
        }
        if (this.state.studentEmailId === "") {
            this.setState({ studentEmailIdError: "Email is required." });
            utilities.showToastMsg("Email is required.")
            return;
        } else {
            this.setState({ studentEmailIdError: null });
        }
        if (this.state.studentMobileNo === "") {
            this.setState({ studentMobileNoError: "Phone number is required." });
            utilities.showToastMsg("Phone number is required.")
            return;
        } else {
            this.setState({ studentMobileNoError: null });
        }
        if (this.state.studentRegNo === "") {
            this.setState({ studentRegNoError: "Registration No is required." });
            utilities.showToastMsg("Registration No is required.")
            return;
        } else {
            this.setState({ studentRegNoError: null });
        }
        if (this.state.studentRegNo.length <= 10) {
            this.setState({ studentRegNoError: "Registration No length should be more than 10 characters." });
            utilities.showToastMsg("Registration No length should be more than 10 characters.")
            return;
        } else {
            this.setState({ studentRegNoError: null });
        }
        if (this.state.institute === "") {
            utilities.showToastMsg("Institute is required.")
            return;
        }
        if (this.state.degree === "") {
            utilities.showToastMsg("Degree is required.")
            return;
        }
        if (this.state.branch === "") {
            utilities.showToastMsg("Branch is required.")
            return;
        }
        if (this.state.passoutYear === "") {
            utilities.showToastMsg("Passout Year is required.")
            return;
        }
        if (this.state.studentAddress === "") {
            this.setState({ studentAddressError: "Address is required." });
            utilities.showToastMsg("Address is required.")
            return;
        } else {
            this.setState({ studentAddressError: null });
        }

        if (this._validateEmail2(this.state.studentEmailId) && this._validateMobileNumber2(this.state.studentMobileNo)) {
            const formData = new FormData();
            formData.append('type', 'register');
            formData.append('registration_type', '0');
            formData.append('student_f_name', this.state.studentFirstName);
            formData.append('student_l_name', this.state.studentLastName);
            formData.append('student_institute', this.state.institute);
            formData.append('student_degree', this.state.degreeID);
            formData.append('student_branch', this.state.bracnhID);
            formData.append('passout_year', this.state.passoutYear);
            formData.append('student_reg_no', this.state.studentRegNo);
            formData.append('student_mob_no', this.state.studentMobileNo);
            formData.append('student_email', this.state.studentEmailId);
            this.callTheRegisterApi(formData);
        }
    }
    callTheRegisterApi = (formData) => {
        console.log("oo");
        console.log(formData);

        this.setState({ loading: true })
        fetch(`${URL}registration`, {
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
                console.log("==-=-=-=-=-=-=");

                console.log(response);
                if (response.status == 200) {
                    if (response.otp) {
                        AsyncStorage.setItem('OTPDATA', response.otp.toString())
                        if (this.state.phoneNumber) {
                            AsyncStorage.setItem('MOBILENO', this.state.phoneNumber)
                        } else if (this.state.agencyMobileNo) {
                            AsyncStorage.setItem('MOBILENO', this.state.agencyMobileNo)
                        } else if (this.state.studentMobileNo) {
                            AsyncStorage.setItem('MOBILENO', this.state.studentMobileNo)
                        }
                    }
                    utilities.showToastMsg(response.message);
                    this.props.navigation.navigate('OTPVerificationForStudent');
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
    _showHeader() {
        if (Platform.OS == 'ios') {
            return (
                <Header style={{ backgroundColor: '#0000FF' }}>
                    <Grid>
                        <Col style={{ justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('StudentLoginScreen')}>
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
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('StudentLoginScreen')}>
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
    selectDegreeID = (degree, listOfDegrees) => {
        if (degree) {
            this.setState({ degree: degree, branchList: [] })
            let idForDegree = _.filter(listOfDegrees, { value: degree })[0].id
            this.setState({ degreeID: idForDegree })
            this.branchesApi(idForDegree)
        }
    }
    settingBranch = (branch, listOfBranches) => {
        let idForBranch = _.filter(listOfBranches, { value: branch })[0].id
        this.setState({ branch: branch, bracnhID: idForBranch })
    }
    setYear = (yr) => {
        console.log(yr);
        this.setState({ passoutYear: yr })
    }
    render() {
        const workingData = [{
            value: 'Public sector',
        }, {
            value: 'Private sector',
        }, {
            value: 'Government Body',
        }, {
            value: 'Public Sector Unit',
        }];
        return (
            <View style={styles.container}>

                {this._showHeader()}
                <StatusBar backgroundColor="#0000FF" />

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

                            <Content>
                                <Form>
                                    <View style={{ marginTop: 0, paddingTop: 0 }}>
                                        {!!this.state.studentFirstNameError ? (
                                            <Form>
                                                <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                    <Input
                                                        placeholder='First Name'
                                                        onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentFirstNameError: null }) }}
                                                        onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    />
                                                    <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                                </Item>
                                                <Text style={styles.errorMsg}>{this.state.studentFirstNameError}</Text>
                                            </Form>
                                        ) :
                                            <Item floatingLabel>
                                                <Label>First Name</Label>
                                                <Input
                                                    autoFocus={true}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    onChangeText={(studentFirstName) => this.setState({ studentFirstName })}
                                                />
                                            </Item>
                                        }

                                        {!!this.state.studentLastNameError ? (
                                            <Form>
                                                <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                    <Input
                                                        placeholder='Last Name'
                                                        onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentLastNameError: null }) }}
                                                        onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    />
                                                    <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                                </Item>
                                                <Text style={styles.errorMsg}>{this.state.studentLastNameError}</Text>
                                            </Form>
                                        ) :
                                            <Item floatingLabel>
                                                <Label>Last Name</Label>
                                                <Input
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    onChangeText={(studentLastName) => this.setState({ studentLastName })}
                                                />
                                            </Item>
                                        }

                                        {!!this.state.studentEmailIdError ? (
                                            <Form>
                                                <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                    <Input
                                                        placeholder='Email'
                                                        onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentEmailIdError: null }) }}
                                                        onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    />
                                                    <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                                </Item>
                                                <Text style={styles.errorMsg}>{this.state.studentEmailIdError}</Text>
                                            </Form>
                                        ) :
                                            <Item floatingLabel>
                                                <Label>Email</Label>
                                                <Input
                                                    keyboardType='email-address'
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    onChangeText={(studentEmailId) => this.setState({ studentEmailId })}
                                                />
                                            </Item>
                                        }

                                        {!!this.state.studentMobileNoError ? (
                                            <Form>
                                                <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                    <Input
                                                        placeholder='+91 Phone Number'
                                                        onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentMobileNoError: null }) }}
                                                        onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    />
                                                    <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                                </Item>
                                                <Text style={styles.errorMsg}>{this.state.studentMobileNoError}</Text>
                                            </Form>
                                        ) :
                                            <Item floatingLabel>
                                                <Label>+91 Phone number</Label>
                                                <Input
                                                    keyboardType='number-pad'
                                                    maxLength={10}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    onChangeText={(studentMobileNo) => this.setState({ studentMobileNo: studentMobileNo })}
                                                />
                                            </Item>
                                        }

                                        {!!this.state.studentRegNoError ? (
                                            <Form>
                                                <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                    <Input
                                                        placeholder='Student Institute Registration Number / Enrollment Number'
                                                        onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentRegNoError: null }) }}
                                                        onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    />
                                                    <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                                </Item>
                                                <Text style={styles.errorMsg}>{this.state.studentRegNoError}</Text>
                                            </Form>
                                        ) :
                                            <Item floatingLabel>
                                                <Label>Student Institute Registration Number / Enrollment Number</Label>
                                                <Input
                                                    maxLength={20}
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    onChangeText={(studentRegNo) => this.setState({ studentRegNo })}
                                                    style={{ marginTop: 30 }}
                                                />
                                            </Item>
                                        }
                                        <View style={{ marginLeft: 10, marginRight: 10 }}>
                                            <Dropdown
                                                label='Institute'
                                                data={this.state.instituteList}
                                                onChangeText={(institute) => this.setState({ institute: institute }, () => this.props.changeNameForInstitute(this.state.institute))}
                                            />
                                        </View>
                                        <View style={{ marginLeft: 10, marginRight: 10 }}>
                                            <Dropdown
                                                label='Degree'
                                                data={this.state.degreeList}
                                                onChangeText={(degree) => this.selectDegreeID(degree, this.state.degreeList)}
                                            />
                                        </View>
                                        <View style={{ marginLeft: 10, marginRight: 10 }}>
                                            <Dropdown
                                                label='Branch'
                                                data={this.state.branchList.length > 0 ? this.state.branchList : []}
                                                onChangeText={(branch) => this.settingBranch(branch, this.state.branchList)}
                                            />
                                        </View>

                                        <View style={{ marginLeft: 10, marginRight: 10 }}>
                                            <Dropdown
                                                label='Passout Year'
                                                data={this.state.passoutYearList.length > 0 ? this.state.passoutYearList : []}
                                                onChangeText={(passoutYear) => this.setYear(passoutYear)}
                                            />
                                        </View>
                                        {!!this.state.studentAddressError ? (
                                            <Form>
                                                <Item style={{ borderColor: 'red', borderWidth: 1 }}>
                                                    <Input
                                                        placeholder='Address'
                                                        onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }); this.setState({ studentAddressError: null }) }}
                                                        onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    />
                                                    <Icon name="exclamation-circle" type="FontAwesome" style={{ fontSize: 20, color: 'red' }} />
                                                </Item>
                                                <Text style={styles.errorMsg}>{this.state.studentAddressError}</Text>
                                            </Form>
                                        ) :
                                            <Item floatingLabel>
                                                <Label>Address</Label>
                                                <Input
                                                    onFocus={() => { this.setState({ borderBottomColorUserName: '#50CAD0' }) }}
                                                    onBlur={() => { this.setState({ borderBottomColorUserName: '#757575' }); }}
                                                    onChangeText={(studentAddress) => this.setState({ studentAddress })}
                                                />
                                            </Item>
                                        }

                                        <Content padder>
                                            <TouchableOpacity onPress={() => this._onPressButton()}>
                                                <View style={styles.buttonSignUp}>
                                                    <Text style={styles.buttonTextSignUp}>SIGN UP</Text>
                                                </View>
                                            </TouchableOpacity>

                                        </Content>
                                    </View>
                                </Form>
                            </Content>
                        </Card>
                    </ScrollView>
                </View>
            </View >
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
        marginLeft: 20,
        marginRight: 20
    },
    cardHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0'
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
        marginLeft: 18,
        fontSize: 12,
        color: 'red'
    }
})
const mapStateToProps = (state) => {
    console.log(state);

    return {
        // user_id: state.VerifierReducer.LoginData.user_id,
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ changeNameForInstitute: changeNameForInstitute }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(StudentSignupScreen)