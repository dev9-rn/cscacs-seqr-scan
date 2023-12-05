import React, { Component } from 'react';
import { NetInfo, StatusBar, BackHandler, Dimensions, Platform, StyleSheet, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container, Header, Left, Body, Right, Content, Card, CardItem, Text, Title, Item, Label, Toast } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CodeInput from 'react-native-confirmation-code-input';
import Loader from '../../Utilities/Loader';
import * as utilities from '../../Utilities/utilities';
import { URL, APIKEY } from '../../../App';
import { connect } from 'react-redux';
var interval;
var time;

class OTPVerificationForStudent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isConnected: true,
            OTP: '',
            time: '',
            otpCode: '',
            borderBottomColorPassword: '#757575',
            borderBottomColorUserName: '#757575',
            loading: false,
            loaderText: 'Verifying mobile number...',
            btnVerifyEnabled: false,
            btnResendOTPEnabled: false,
            asyncOTP: '',
            mobileNo: ''
        };
    }
    componentWillMount() { this._getAsyncData(); }
    componentDidMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackPress); this.countdown(); }
    componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress); clearInterval(interval); }
    handleBackPress = () => { BackHandler.exitApp(); return true; }
    async _getAsyncData() {
        await AsyncStorage.getItem('OTPDATA', (err, result) => {	
            console.log("otpdata - student", result);	// OTPDATA is set on SignUP screen
            this.setState({ asyncOTP: result });
        });
        await AsyncStorage.getItem('MOBILENO', (err, result) => {		// MobileNo is set on SignUP screen
            console.log(result);
            this.setState({ mobileNo: result });
        });
    }
    countdown() {
        if (!this.state.btnResendOTPEnabled) {
            var timer = '3:00';
            timer = timer.split(':');
            var minutes = timer[0];
            var seconds = timer[1];
            interval = setInterval(() => {
                seconds -= 1;
                if (minutes < 0) return;
                else if (seconds < 0 && minutes != 0) {
                    minutes -= 1;
                    seconds = 59;
                }
                else if (seconds < 10 && seconds.length != 2) {
                    seconds = '0' + seconds;
                }
                time = minutes + ':' + seconds;
                this.setState({ time: time });

                if (minutes == 0 && seconds == 0) {
                    this.setState({ btnResendOTPEnabled: true });
                    clearInterval(interval);
                }
            }, 1000);
        }
    }
    _onFinishCheckingCode1(code) {
        this.setState({ btnVerifyEnabled: true, otpCode: code });

    }
    validateOTP() {
        console.log("validate otp");
        console.log(this.state.asyncOTP+"");
        console.log(this.lOTP)
        let lOTP = this.state.otpCode;
        let res = '';
        if (this.state.asyncOTP+"" == lOTP) {
            res = true;
        } else {
            res = false;
        }
        return res;
    }
    async callForAPI() {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('type', 'verification');
        formData.append('mobile_no', this.state.mobileNo);
        formData.append('otp', this.state.otpCode);
        formData.append('institute', this.props.changedInstituteName);
        formData.append('user_type', this.props.userType);
        console.log(formData);
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
                console.log(response);
                if (response.status == 200) {
                    utilities.showToastMsg(response.message);
                    setTimeout(() => {
                        this.props.navigation.navigate('StudentLoginScreen');
                    }, 800);
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
    _onPressButton() {
        let lOTP = this.state.otpCode;
        var isValidOTP = '';
        if (lOTP == '') {
            utilities.showToastMsg('Enter OTP');
        }
        else if (lOTP) {
            isValidOTP = this.validateOTP();
            if (isValidOTP) {
                this.callForAPI();
            } else {
                utilities.showToastMsg('Verification failed! OTP mismatch');
            }
        } else {
            console.warn('Error');
        }
    }

    async _onPressResendOTP() {
        this.setState({ btnResendOTPEnabled: false })
        const formData = new FormData();
        formData.append('type', 'resendOtp');
        formData.append('mobile_no', this.state.mobileNo);
        formData.append('institute', this.props.changedInstituteName);
        formData.append('user_type', this.props.userType);
        console.log(formData);

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
                console.log(response);
                if (response.status == 200) {
                    utilities.showToastMsg(response.message);
                    this.countdown();
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

    _showBtnVerify() {
        if (this.state.btnVerifyEnabled) {
            return (
                <TouchableOpacity onPress={() => this._onPressButton()}>
                    <View style={styles.buttonVerifier}>
                        <Text style={styles.buttonText}>VERIFY</Text>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity>
                    <View style={styles.btnVerifyDisabled}>
                        <Text style={styles.textVerifyDisabled}>VERIFY</Text>
                    </View>
                </TouchableOpacity>
            );
        }
    }

    _showBtnResendOTP() {
        if (this.state.btnResendOTPEnabled) {
            return (
                <TouchableOpacity onPress={() => this._onPressResendOTP()}>
                    <View style={styles.btnResendOTP}>
                        <Text style={styles.buttonText}>RESEND OTP</Text>
                    </View>
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity>
                    <View style={styles.btnResendOTPDisabled}>
                        <Text style={styles.textResendOTPDisabled}>
                            RESEND OTP in
						</Text>
                        <Text style={{ marginLeft: 2, color: 'white' }}>{this.state.time} </Text>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Header style={{ backgroundColor: '#0000FF' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center', textAlignVertical: 'center' }}>Demo SeQR Scan</Text>
                </Header>
                <StatusBar backgroundColor="#0000FF" />

                <Loader
                    loading={this.state.loading}
                    text={this.state.loaderText}
                />

                <View style={styles.OTPViewContainer}>
                    <ScrollView keyboardShouldPersistTaps="always">
                        <Card style={styles.cardContainer}>

                            <CardItem header style={styles.cardHeader}>
                                <Text style={{ marginLeft: -12, color: '#212121', fontWeight: 'normal', fontSize: 18 }}>Verify mobile number</Text>
                            </CardItem>

                            <View style={{ paddingLeft: 0, paddingRight: 0, marginTop: 10 }}>
                                <Text style={{ fontSize: 14, color: '#808080' }}>OTP has been sent to your mobile number, please enter it below.</Text>
                                <View style={styles.inputContainer}>
                                    <CodeInput
                                        ref="codeInputRef2"
                                        keyboardType="number-pad"
                                        inactiveColor='white'
                                        autoFocus={false}
                                        ignoreCase={true}
                                        className='border-b-t'
                                        size={35}
                                        onFulfill={(code) => this._onFinishCheckingCode1(code)}
                                        containerStyle={{ marginTop: 10, marginBottom: 10, }}
                                        codeInputStyle={{ color: 'black', borderWidth: 1.5, borderBottomColor: 'black', borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
                                        codeLength={6}
                                    />

                                </View>
                            </View>

                            <Content padder>
                                {this._showBtnVerify()}

                                <View style={{ marginTop: 20 }}>
                                    <Text style={{ fontSize: 12 }}>Didn't received OTP?</Text>
                                </View>

                                {this._showBtnResendOTP()}
                            </Content>

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
    OTPViewContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingTop: Dimensions.get('window').height * 0.05
    },
    cardContainer: {
        flex: 1,
        padding: 15,
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
    },
    cardHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0'
    },
    inputContainer: {
        marginTop: 30,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputs: {
        height: 45,
        width: 50,
        marginLeft: 5,
        borderBottomWidth: 1,

    },
    buttonVerifier: {
        marginTop: 10,
        alignItems: 'center',
        backgroundColor: '#0000FF',
        borderRadius: 5
    },
    btnVerifyDisabled: {
        marginTop: 10,
        alignItems: 'center',
        backgroundColor: '#D3D3D3',
        borderRadius: 5
    },
    btnResendOTP: {
        marginTop: 3,
        alignItems: 'center',
        backgroundColor: '#0000FF',
        borderRadius: 5
    },
    buttonText: {
        padding: 10,
        color: 'white',
    },
    textVerifyDisabled: {
        padding: 10,
        color: 'white',
    },
    btnResendOTPDisabled: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 3,
        alignItems: 'center',
        backgroundColor: '#D3D3D3',
        borderRadius: 5
    },
    textResendOTPDisabled: {
        padding: 10,
        color: 'white',
    }
})
const mapStateToProps = (state) => {
    console.log(state);
    return {
        changedInstituteName: state.VerifierReducer.changedInstituteName,
        userType: state.VerifierReducer.LoginData.registration_type
    }
}
export default connect(mapStateToProps, null)(OTPVerificationForStudent)