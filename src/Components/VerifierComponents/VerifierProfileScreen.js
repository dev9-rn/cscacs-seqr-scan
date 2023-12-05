import React, { Component } from 'react';
import { Header, Card, Text, Title, Icon, CardItem, Label, Input, Item } from 'native-base';
import { StatusBar, Platform, View, Image, TouchableOpacity, ScrollView, BackHandler, StyleSheet } from 'react-native';
import { Col, Grid, Row } from 'react-native-easy-grid';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { URL, APIKEY } from '../../../App';
import { connect } from 'react-redux';
import * as utilities from '../../Utilities/utilities';
import Loader from '../../Utilities/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bindActionCreators } from 'redux';
import { clearTheStoreOnLogout } from '../../Redux/Actions/VerifierActions';
import { Dropdown } from 'react-native-material-dropdown';

class VerifierProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            loaderText: 'Loading...',
            profileData: {},
            newPw: '',
            confirmPw: '',
            showHidePW: true,
            showHideCPW: true,
            newPwError: false,
            confirmPwError: false,
            password: ''
        }
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
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
                else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('StudentLoginScreen') }
                else if (response.status == 405) { utilities.showToastMsg(response.message); }
            })
            .catch(error => {
                this.setState({ loading: false })
                console.log(error);
            });
    }
    componentDidMount = () => {
        this.getPRofileData(), BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        AsyncStorage.getItem('password', (err, result) => {
            this.setState({ password: result })
        })
        if (this.props.userType != 0) {
            this.instituteApi()
        }
    }
    componentWillMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick); }
    componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick); }
    handleBackButtonClick() { this.props.navigation.goBack(null); return true; }
    _aboutUs() { this.props.navigation.navigate('AboutUs'); }
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
                console.log(response);
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
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Profile</Title>
                        </Col>
                        <Col size={2} style={{ justifyContent: 'center', alignItems: 'flex-end', marginRight: 3 }}>
                            <Menu>
                                <MenuTrigger>
                                    <Image style={{ width: 20, height: 20, paddingRight: 15 }} source={require('../../images/three_dots.png')} />
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
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Profile</Title>
                        </Col>
                        <Col size={2} style={{ justifyContent: 'center', alignItems: 'flex-end', marginRight: 3 }}>
                            <Menu>
                                <MenuTrigger>
                                    <Image style={{ width: 20, height: 20, paddingRight: 15 }} source={require('../../images/three_dots.png')} />
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
    getPRofileData = () => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('type', 'get_user_profile');
        formData.append('user_id', this.props.user_id);
        formData.append('institute', this.props.changedInstituteName);
        formData.append('user_type', this.props.userType);
        console.log(formData);
        fetch(`${URL}user-profile`, {
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
                console.log(response);
                if (response.status == 200) {
                    this.setState({ profileData: response.data[0] })
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
    _onSubmitPress = () => {
        if (!this.state.collegeName && this.props.userType != 0) {
            utilities.showToastMsg("Please select college.");
            return;
        } else if (!this.state.newPw && !this.state.confirmPw) {
            utilities.showToastMsg("New & Confirm password is required.");
            return;
        } else if (!this.state.newPw) {
            utilities.showToastMsg("New password is required.");
            return;
        } else if (!this.state.confirmPw) {
            utilities.showToastMsg('Confirm password is required.');
            return;
        } else if (this.state.newPw.length < 8) {
            utilities.showToastMsg("Min 8 characters is required.");
        }
        else if (this.state.newPw !== this.state.confirmPw) {
            utilities.showToastMsg("Passwords doesn't match.");
            return;
        } else {
            this.setState({ loading: true })
            const formData = new FormData();
            formData.append('type', 'change_password');
            formData.append('user_id', this.props.user_id);
            formData.append('current_password', this.state.password);
            formData.append('new_password', this.state.newPw);
            formData.append('confirm_password', this.state.confirmPw);
            formData.append('institute', this.state.collegeName ? this.state.collegeName : this.props.changedInstituteName);
            formData.append('user_type', this.props.userType);

            console.log(formData);
            fetch(`${URL}change-password`, {
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
                    console.log(response);
                    if (response.status == 200) {
                        utilities.showToastMsg(response.message);
                        AsyncStorage.setItem('password', this.state.newPw)
                        this.setState({ passwordValues: "" })
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
    }
    render() {
        console.log("profiledata =====",this.state.profileData.fullname);
        return (
            <ScrollView keyboardShouldPersistTaps={'handled'}>
                {this._showHeader()}
                <StatusBar backgroundColor="#0000FF" />
                <Loader loading={this.state.loading} text={this.state.loaderText} />
                <View style={{ margin: 10 }}>
                    <Card>
                        <CardItem style={{ padding: 5, margin: 0 }}>
                            <Grid>
                                <Row>
                                    <Col size={4}>
                                        <Text style={{ marginTop: 16, bottom: 10, color: 'gray' }}>Name </Text>
                                    </Col>
                                    <Text style={{ marginTop: 5 }}>  : </Text>
                                    <Col size={6}>
                                        <Text style={{ marginTop: 16, bottom: 10 }}>{this.state.profileData.fullname} {this.state.profileData.l_name}</Text>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col size={4}>
                                        <Text style={{ marginTop: 16, bottom: 10, color: 'gray' }}>Username </Text>
                                    </Col>
                                    <Text style={{ marginTop: 5 }}>  : </Text>
                                    <Col size={6}>
                                        <Text style={{ marginTop: 16, bottom: 10 }}>{this.state.profileData.username}</Text>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col size={4}>
                                        <Text style={{ marginTop: 16, bottom: 10, color: 'gray' }}>Registration No </Text>
                                    </Col>
                                    <Text style={{ marginTop: 5 }}>  : </Text>
                                    <Col size={6}>
                                        <Text style={{ marginTop: 16, bottom: 10 }}>{this.state.profileData.registration_no ? this.state.profileData.registration_no : '-'}</Text>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col size={4}>
                                        <Text style={{ marginTop: 16, bottom: 10, color: 'gray' }}>Mobile No </Text>
                                    </Col>
                                    <Text style={{ marginTop: 5 }}>  : </Text>
                                    <Col size={6}>
                                        <Text style={{ marginTop: 16, bottom: 10 }}>{this.state.profileData.mobile_no ? this.state.profileData.mobile_no : '-'}</Text>
                                    </Col>
                                </Row>
                                {this.props.userType == 0 ?
                                    <View style={{ flex: 1 }}>
                                        <Row>
                                            <Col size={4}>
                                                <Text style={{ marginTop: 16, bottom: 10, color: 'gray' }}>Institute </Text>
                                            </Col>
                                            <Text style={{ marginTop: 5 }}>  : </Text>
                                            <Col size={6}>
                                                <Text style={{ marginTop: 16, bottom: 10 }}>{this.state.profileData.institute ? this.state.profileData.institute : '-'}</Text>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col size={4}>
                                                <Text style={{ marginTop: 16, bottom: 10, color: 'gray' }}>Degree </Text>
                                            </Col>
                                            <Text style={{ marginTop: 5 }}>  : </Text>
                                            <Col size={6}>
                                                <Text style={{ marginTop: 16, bottom: 10 }}>{this.state.profileData.degree_name ? this.state.profileData.degree_name : '-'}</Text>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col size={4}>
                                                <Text style={{ marginTop: 16, bottom: 10, color: 'gray' }}>Branch Name </Text>
                                            </Col>
                                            <Text style={{ marginTop: 5 }}>  : </Text>
                                            <Col size={6} >
                                                <Text style={{ marginTop: 16, bottom: 10 }}>{this.state.profileData.branch_name_long ? this.state.profileData.branch_name_long : '-'}</Text>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col size={4}>
                                                <Text style={{ marginTop: 16, bottom: 10, color: 'gray' }}>Passout Year </Text>
                                            </Col>
                                            <Text style={{ marginTop: 5 }}>  : </Text>
                                            <Col size={6}>
                                                <Text style={{ marginTop: 16, bottom: 10 }}>{this.state.profileData.passout_year ? this.state.profileData.passout_year : '-'}</Text>
                                            </Col>
                                        </Row>
                                    </View>
                                    : <View />}
                            </Grid>
                        </CardItem>
                    </Card>
                    {this.props.userType != 0 ?
                        <View style={{ marginLeft: 30, marginRight: 30 }}>
                            <Dropdown
                                label='Select College'
                                data={this.state.instituteList}
                                onChangeText={(collegeName) => this.setState({ collegeName: collegeName })}
                            />
                        </View> : <View />}
                    <Card style={{ marginTop: this.props.userType == 0 ? 0 : 20 }} >
                        <Text style={{ fontWeight: 'bold', fontSize: 17, marginLeft: 9, marginTop: 10 }}>Change Password :-</Text>
                        <CardItem>
                            <Grid>
                                <Row>
                                    <Item floatingLabel style={{ flex: 1 }}>
                                        <Label style={{ color: 'grey' }}>New Password</Label>
                                        <Input
                                            value={this.state.passwordValues}
                                            secureTextEntry={this.state.showHidePW}
                                            onChangeText={(password) => this.setState({ newPw: password })}
                                        />
                                        {this.state.showHidePW ?
                                            <Icon type="FontAwesome" name="eye" style={{ fontSize: 25, color: 'red', paddingLeft: 13 }} onPress={() => this.setState({ showHidePW: false })} />
                                            :
                                            <Icon type="FontAwesome" name="eye-slash" style={{ fontSize: 25, color: 'red', paddingLeft: 13 }} onPress={() => this.setState({ showHidePW: true })} />
                                        }
                                    </Item>
                                </Row>
                                <Row style={{ marginTop: 10 }}>
                                    <Item floatingLabel style={{ flex: 1 }}>
                                        <Label style={{ color: 'grey' }}>Confirm Password</Label>
                                        <Input
                                            value={this.state.passwordValues}
                                            secureTextEntry={this.state.showHideCPW}
                                            onChangeText={(password) => this.setState({ confirmPw: password })}
                                        />
                                        {this.state.showHideCPW ?
                                            <Icon type="FontAwesome" name="eye" style={{ fontSize: 25, color: 'red', paddingLeft: 13 }} onPress={() => this.setState({ showHideCPW: false })} />
                                            :
                                            <Icon type="FontAwesome" name="eye-slash" style={{ fontSize: 25, color: 'red', paddingLeft: 13 }} onPress={() => this.setState({ showHideCPW: true })} />
                                        }
                                    </Item>
                                </Row>
                                <Row>
                                    <TouchableOpacity onPress={() => this._onSubmitPress()} style={{ alignItems: 'center', flex: 1, marginTop: 10 }}>
                                        <View style={styles.buttonSignUp}>
                                            <Text style={styles.buttonTextSignUp}>Change Password</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Row>
                            </Grid>
                        </CardItem>
                    </Card>
                </View>
            </ScrollView>
        )
    }
}
const styles = StyleSheet.create({
    buttonSignUp: {
        marginTop: 20,
        alignItems: 'center',
        backgroundColor: '#94302C',
        borderRadius: 5,
        width: '50%',
        justifyContent: 'center'
    },
    buttonTextSignUp: {
        padding: 10,
        color: '#fcb52f',
    }
})
const mapStateToProps = (state) => {
    return {
        accessToken: state.VerifierReducer.LoginData.access_token,
        user_id: state.VerifierReducer.LoginData.id,
        changedInstituteName: state.VerifierReducer.institute,
        userType: state.VerifierReducer.LoginData.user_type
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ clearStore: clearTheStoreOnLogout }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(VerifierProfileScreen)