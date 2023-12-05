import React, { Component } from 'react';
import { URL, APIKEY } from '../../../App';
import { StatusBar, BackHandler, Easing, Animated, Platform, Image, TouchableOpacity, ScrollView,Dimensions } from 'react-native';
import { Header, Card, Text, Title, Icon, CardItem, View, } from 'native-base';
import { connect } from 'react-redux';
import Loader from '../../Utilities/Loader';
import { Col, Grid, Row } from 'react-native-easy-grid';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import * as utilities from '../../Utilities/utilities';
import { bindActionCreators } from 'redux';
import { clearTheStoreOnLogout, changeNameForInstitute } from '../../Redux/Actions/VerifierActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-material-dropdown';

class VerifierStatusScreen extends Component {
    constructor(props) {
        super(props);
        this.animatedValue = new Animated.Value(0)
        this.state = {
            verificationList: [],
            verificationDetails: [],
            loading: false,
            loaderText: 'Please wait...',
            documentType: '',
            uploadedFile: '',
            resultsFound: '',
            remark: '',
            examName: '',
            semester: '',
            collegeName: '',
            instituteList: [],
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
        this.animate();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        if (this.props.userType == 0) {
            this.getRequestList()
        } else {
            this.instituteApi()
        }
    }
    componentWillMount() { BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick); }
    componentWillUnmount() { BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick); }
    handleBackButtonClick() { this.props.navigation.goBack(null); return true; }
    getRequestList = () => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('type', 'getRequestsList');
        formData.append('user_id', this.props.user_id);
        formData.append('user_type', this.props.userType);
        formData.append('institute', this.props.userType == 0 ? this.props.changedInstituteName : this.state.collegeName);

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
            .then(response => {
                console.log("status response",response);
                this.setState({ loading: false })
                if (response.status == 200) {
                    if (this.props.userType != 0) {
                        this.props.changeNameForInstitute(this.state.collegeName)
                    }
                    this.setState({ verificationList: response.data })
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
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Verification Status</Title>
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
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Verification Status</Title>
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
    _aboutUs() { this.props.navigation.navigate('AboutUs'); }
    _callForLogoutAPI = () => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('type', 'logout');
        formData.append('institute', this.props.changedInstituteName);
        formData.append('user_id', this.props.user_id);
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
    animate() {
        this.animatedValue.setValue(0)
        Animated.timing(
            this.animatedValue,
            {
                toValue: 1,
                duration: 1050, 
                easing: Easing.linear,
                useNativeDriver: false,
            }
        ).start(() => this.animate())
    }
    render() {
        const opacity = this.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0]
        })
        const textSize = this.animatedValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [18, 32, 18]
        })
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#f2f2f2' }} keyboardShouldPersistTaps={'handled'}>
                {this._showHeader()}
                <StatusBar backgroundColor="#0000FF" />
                {this.props.userType != 0 ?
                    <View style={{ marginLeft: 30, marginRight: 30 }}>
                        <Dropdown
                            label='Select College'
                            data={this.state.instituteList}
                            onChangeText={(collegeName) => this.setState({ collegeName: collegeName }, () => this.getRequestList())}
                        />
                    </View> : <View />}
                <Loader loading={this.state.loading} text={this.state.loaderText} />
                {this.state.verificationList.length > 0 ?
                    this.state.verificationList.map((data, key) => (
                        <TouchableOpacity style={{ marginLeft: 5, marginRight: 5 }} onPress={() => { this.props.navigation.navigate('VerifierDetailsScreen', { requestID: data.id, user_id: this.props.user_id }) }}>
                            <Card>
                                <CardItem>
                                    <Grid>
                                        <Text>#{key + 1}</Text>
                                        <Row style={{  marginTop: 5 }}>
                                            <Col>
                                                <Text>Request No</Text>
                                            </Col>
                                            <Text style={{ bottom: 0 }}>: </Text>
                                            <Col>
                                                <Text> {data.request_number}</Text>
                                            </Col>
                                        </Row>
                                        <Row style={{  marginTop: 5 }}>
                                        <Col>
                                                <Text>Student Name</Text>
                                            </Col>
                                            <Text style={{ bottom: 0 }}>: </Text>
                                            <Col>
                                            
                                                <Text >{data.student_name}</Text>
                                           
                                            </Col>
                                        </Row>
                                        <Row style={{  marginTop: 5 }}>
                                            <Col>
                                                <Text>No Of Documents</Text>
                                            </Col>
                                            <Text style={{ bottom: 0 }}>: </Text>
                                            <Col>
                                                <Text>{data.no_of_documents}</Text>
                                            </Col>
                                        </Row>
                                        <Row style={{  marginTop: 5 }}>
                                        <Col>
                                                <Text>Submitted Date</Text>
                                            </Col>
                                            <Text style={{ bottom: 0 }}>: </Text>
                                            <Col>
                                                <Text >{data.payment_date_time}</Text>
                                            </Col>
                                        </Row>
                                        <Row style={{  marginTop: 5 }}>
                                            <Col>
                                                <Text>Paid Amount</Text>
                                            </Col>
                                            <Text style={{ bottom: 0 }}>: </Text>
                                            <Col>
                                                <Text>{data.total_amount}</Text>
                                            </Col>
                                        </Row>
                                        <Row style={{ marginTop: 5 }}>
                                            <Col>
                                                <Text>Verification Status</Text>
                                            </Col>
                                            <Text style={{ bottom: 0 }}>: </Text>
                                            <Col>
                                                <Text>{data.verification_status}</Text>
                                            </Col>
                                        </Row>
                                        <Row style={{  marginTop: 5 }}>
                                            <Col>
                                                <Text>Recruiter Name</Text>
                                            </Col>
                                            <Text style={{ bottom: 0 }}>: </Text>
                                            <Col>
                                                <Text>{data.name_of_recruiter ? data.name_of_recruiter : '-'}</Text>
                                            </Col>
                                        </Row>
                                        <Text></Text>
                                    </Grid>
                                </CardItem>
                            </Card>
                        </TouchableOpacity>
                    )) :
                    <View />
                    // <Text style={{ color: 'red', textAlign: 'center', textAlignVertical: 'center', flex: 1, fontSize: 20 }}>No Data Available</Text>
                }

                {this.state.verificationList.length == 0 && this.state.collegeName ?
                    <Text style={{ marginTop: 90, color: 'red', textAlign: 'center', textAlignVertical: 'center', flex: 1, fontSize: 20 }}>No Data Available</Text>
                    : <View />
                }
                {this.state.verificationList.length == 0 && this.props.userType == 0 ?
                    <Text style={{ marginTop: 90, color: 'red', textAlign: 'center', textAlignVertical: 'center', flex: 1, fontSize: 20 }}>No Data Available</Text>
                    : <View />
                }
                {this.props.userType != 0 && !this.state.collegeName ?
                    <View style={{ flex: 1, justifyContent: 'center', marginTop: 80 }}>
                        <Animated.View style={{ opacity }}>
                            <Icon type="FontAwesome" name="hand-o-up" style={{ fontSize: 200, color: 'red', textAlign: 'center' }} />
                        </Animated.View>
                        <Text style={{ textAlign: 'center', color: 'red', fontSize: 30, marginTop: 20, fontWeight: 'bold' }}>Please select college</Text>
                    </View> : <View />
                }
            </ScrollView>
        )
    }
}
const mapStateToProps = (state) => {
    console.log(state);

    return {
        accessToken: state.VerifierReducer.LoginData.access_token,
        user_id: state.VerifierReducer.LoginData.id,
        changedInstituteName: state.VerifierReducer.changedInstituteName,
        userType: state.VerifierReducer.LoginData.user_type
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ clearStore: clearTheStoreOnLogout, changeNameForInstitute: changeNameForInstitute }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(VerifierStatusScreen)