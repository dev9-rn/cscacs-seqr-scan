import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'native-base';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { URL, APIKEY, URLFORINSTITUTE } from '../../App';
import { bindActionCreators } from 'redux';
import { setVerifierUserData, changeNameForInstitute } from '../Redux/Actions/VerifierActions';

class NavigateScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            token: '',
            password: '',
            userName: '',
            status: '',
            urlForInstitute: ''
        }
        AsyncStorage.getItem('accessToken', (err, result) => {
            this.setState({ token: result })
        })
        AsyncStorage.getItem('username', (err, result) => {
            this.setState({ userName: result })
        })
        AsyncStorage.getItem('password', (err, result) => {
            this.setState({ password: result }, () => {
                if (this.state.userName) {
                    this.submitPressed();
                } else {
                    this.props.navigation.navigate('HomeScreen')
                }
            })
        })
        AsyncStorage.getItem('InstituteURL', (err, result) => {
            this.setState({ urlForInstitute: result })
        });
        AsyncStorage.getItem('InstituteData', (err, result) => {
            var lData = JSON.parse(result);
            console.log('=======lData',lData);
            if (lData) {
                console.log(lData)
                this.setState({ status: lData.status, userName: lData.username, password: lData.password });
                this.submitPressed();
            } else {
                this.props.navigation.navigate('HomeScreen')
            }
        });
    }
    submitPressed() {
        this.setState({ loading: true });
        if (this.state.status !== '1') {
            console.log("inside if");

            const formData = new FormData();
            formData.append('type', 'login');
            formData.append('username', this.state.userName);
            formData.append('password', this.state.password);
            formData.append('institute', this.props.changedInstituteName);
            AsyncStorage.setItem('collegeName', this.props.changedInstituteName)
            this.props.changeNameForInstitute(this.props.changedInstituteName)

            // AsyncStorage.setItem('USERDATA', { username: this.state.username, password: this.state.password })
            console.log(formData);
            fetch(`${URL}user-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart\/form-data',
                    'apikey': APIKEY,
                },
                body: formData,
            }).then(res => {
                res.json().then(response => {
                    console.log("-=-=-=-==-=-=-=-=-");

                    console.log(response);
                    console.log(res.headers.map.accesstoken);
                    this.setState({ loading: false, accessToken: res.headers.map.accesstoken })
                    console.log(response);
                    if (response.status == 200) {
                        var response = response.data;
                        AsyncStorage.setItem('accessToken', this.state.accessToken)
                        response.accessToken = this.state.accessToken
                        this.props.setVerifierData(response)
                        this.props.navigation.navigate('VerifierMainScreen')
                    }
                })
            }).catch(error => {
                this.setState({ loading: false })
                console.log(error);
            });
        } else {
            console.log("inside else");

            const formData = new FormData();
            formData.append('institute_username', this.state.userName);
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
                    console.log('==lResponseData',lResponseData);
                    if (lResponseData.status == 200) {
                        try {
                            lResponseData.password = this.state.password;
							lResponseData.status = '1';
							lResponseData.username = this.state.username;
                            AsyncStorage.setItem('InstituteData', JSON.stringify(lResponseData));
                            this.props.navigation.navigate('InstituteMainScreen');
                        } catch (error) {
                            console.warn(error);
                        }
                    }
                })
                .catch(error => {
                    this.setState({ loading: false })
                    console.log(error);
                });
        }
    }
    render() {
        return (
            <View></View>
        )
    }
}
const mapStateToProps = (state) => {
    console.log("-----WWE--==-=-=-===-");
    console.log(state);
    
    return {
        changedInstituteName: state.VerifierReducer.changedInstituteName,
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ setVerifierData: setVerifierUserData, changeNameForInstitute: changeNameForInstitute }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(NavigateScreen)