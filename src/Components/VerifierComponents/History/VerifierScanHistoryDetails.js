import React, { Component } from 'react';
import { URL, APIKEY } from '../../../../App';
import { connect } from 'react-redux';
import { StatusBar, Dimensions, Platform, View, Image, TouchableOpacity, ScrollView, BackHandler, StyleSheet, } from 'react-native';
import { Header, Card, Text, Title, Icon } from 'native-base';
import Loader from '../../../Utilities/Loader';
import * as utilities from '../../../Utilities/utilities';
import { Col, Grid, Row } from 'react-native-easy-grid';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { bindActionCreators } from 'redux';
import { clearTheStoreOnLogout } from '../../../Redux/Actions/VerifierActions';
import ImageZoom from 'react-native-image-pan-zoom';
import Pdf from 'react-native-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';

class VerifierScanHistoryDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            loaderText: 'Please wait...',
            requestId: this.props.navigation.state.params.requestID,
            docPath: '',
            historyList: []
        }
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    componentDidMount = () => { 
        this.getScanHistoryDetails(), BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick); }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    handleBackButtonClick() {
        this.props.navigation.goBack(null);
        return true;
    }
    _aboutUs() { this.props.navigation.navigate('AboutUs'); }
    _callForLogoutAPI = () => {
        const formData = new FormData();
        formData.append('type', 'logout');
        formData.append('institute', this.props.changedInstituteName);
        formData.append('user_id', this.props.navigation.state.params.user_id);
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
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierScanHistory")}>
                                <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={8} style={{ justifyContent: 'center' }}>
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>History Details</Title>
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
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("VerifierScanHistory")}>
                                <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={8} style={{ justifyContent: 'center' }}>
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>History Details</Title>
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
    getScanHistoryDetails = () => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('type', 'getRequestDetails');
        formData.append('user_id', this.props.navigation.state.params.user_id);
        formData.append('request_id', this.state.requestId);
        formData.append('user_type', this.props.userType);
        formData.append('institute', this.props.changedInstituteName);

        console.log("=-=-=-=-=");
        console.log(formData);


        fetch(`${URL}scan-model`, {
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
                console.log("-----",response);
                this.setState({ loading: false })
                if (response.status == 200) {
                    this.setState({
                        historyList: response.data
                    })
                } else if (response.status == 409) { utilities.showToastMsg(response.message); }
                else if (response.status == 422) { utilities.showToastMsg(response.message); }
                else if (response.status == 400) { utilities.showToastMsg(response.message); }
                else if (response.status == 403) { utilities.showToastMsg(response.message); this.props.navigation.navigate('VerifierLoginScreen') }
                else if (response.status == 405) { utilities.showToastMsg(response.message); }
            })
            .catch(error => {
                this.setState({ loading: false })
                console.log("----",error);
            });
    }
    render() {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#f2f2f2' }} keyboardShouldPersistTaps={'handled'}>
                {this._showHeader()}
                <StatusBar backgroundColor="#0000FF" />
                <Loader loading={this.state.loading} text={this.state.loaderText} />
                <View style={{ flex: 1, justifyContent: 'center', marginTop: 20, margin: 10 }}>
                    <ScrollView directionalLockEnabled={false} horizontal={true} keyboardShouldPersistTaps={'handled'}>
                        {this.state.historyList.length > 0 ? this.state.historyList.map((data) => (
                            <Card style={{ flex: 1, height: Dimensions.get('window').height * 0.82, width: Dimensions.get('window').width * 0.94 }}>
                                <Pdf source={data.pdf_path ? ({ uri: data.pdf_path }) : ""}
                                    onLoadComplete={(numberOfPages, filePath) => { console.log(`number of pages: ${numberOfPages}`); }}
                                    onPageChanged={(page, numberOfPages) => { console.log(`current page: ${page}`); }}
                                    onError={(error) => { console.log(error); }}
                                    style={styles.pdf}
                                />
                                <Text style={{ marginTop: 15, textAlign: 'center', bottom: 10 }}>Amount : {data.amount}</Text>
                            </Card>
                        )) : <View></View>}
                    </ScrollView>
                </View>
            </ScrollView>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 25,
    },
    pdf: {
        flex: 1,
    },
    cardContainer: {
        padding: 15,
        // marginTop: 10,
        marginLeft: 20,
        marginRight: 20
    },
    certificateViewContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingTop: Dimensions.get('window').height * 0.05
    },
});
const mapStateToProps = (state) => {
    console.log("----",state);

    return {
        accessToken: state.VerifierReducer.LoginData.access_token,
        changedInstituteName: state.VerifierReducer.changedInstituteName,
        userType: state.VerifierReducer.LoginData.user_type
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ clearStore: clearTheStoreOnLogout }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(VerifierScanHistoryDetails)