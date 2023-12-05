import React, { Component } from 'react';
import { URL, APIKEY } from '../../../App';
import { connect } from 'react-redux';
import { StatusBar, Dimensions, Platform, View, Image, TouchableOpacity, ScrollView, BackHandler, StyleSheet, } from 'react-native';
import { Header, Card, Text, Title, Icon, CardItem } from 'native-base';
import Loader from '../../Utilities/Loader';
import * as utilities from '../../Utilities/utilities';
import { Col, Grid, Row } from 'react-native-easy-grid';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { bindActionCreators } from 'redux';
import { clearTheStoreOnLogout } from '../../Redux/Actions/VerifierActions';
import ImageZoom from 'react-native-image-pan-zoom';
import Pdf from 'react-native-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';

class VerifierDetailsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            verificationDetails: [],
            otherData: [],
            loading: false,
            loaderText: 'Please wait...',
            requestId: this.props.navigation.state.params.requestID,
            showHideImage: false,
            docPath: '',
            showPdf: false,
            keyToCheck: '',
            showHideCard: false
        }
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    componentDidMount = () => { this.getRequestDetails(), BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick); }
    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    handleBackButtonClick() {
        this.setState({ showHideImage: false })
        // this.props.navigation.goBack(null);
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
                            <TouchableOpacity onPress={() => this.state.showPdf ? this.setState({ showPdf: false }) : this.props.navigation.navigate("VerifierStatusScreen")}>
                                <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={8} style={{ justifyContent: 'center' }}>
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Verification Details</Title>
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
                            <TouchableOpacity onPress={() => this.state.showPdf ? this.setState({ showPdf: false }) : this.props.navigation.navigate("VerifierStatusScreen")}>
                                <Icon type="FontAwesome" name="long-arrow-left" style={{ fontSize: 25, color: "#FFFFFF", paddingLeft: 10, paddingRight: 10 }} />
                            </TouchableOpacity>
                        </Col>
                        <Col size={8} style={{ justifyContent: 'center' }}>
                            <Title style={{ color: '#FFFFFF', fontSize: 16 }}>Verification Details</Title>
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
    getRequestDetails = () => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('type', 'getRequestDetails');
        formData.append('user_id', this.props.navigation.state.params.user_id);
        formData.append('request_id', this.state.requestId);
        formData.append('user_type', this.props.userType);
        formData.append('institute', this.props.changedInstituteName);
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
                console.log("--",response);
                this.setState({ loading: false })
                if (response.status == 200) {
                    this.setState({
                        verificationDetails: response.data[0]
                    }, () => {
                        for (var key in response.otherData) {
                            this.setState({ otherData: response.otherData[0] })
                        };
                    })
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
    showZoomedImage = (path) => {
        console.log(path);
        if (path.indexOf('pdf') > -1) {
            const pth = { uri: path }
            this.setState({ docPath: pth, showPdf: true })
        } else {
            this.setState({ docPath: path, showHideImage: true, showPdf: false })
        }
    }
    fnForShowHide = (key) => {
        this.setState(prevState => ({
            showHideCard: !prevState.showHideCard, keyToCheck: key
        }));
    }
    render() {
        console.log(this.state.keyToCheck+"---"+ this.state.showHideCard);

        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#f2f2f2' }} keyboardShouldPersistTaps={'handled'}>
                {this._showHeader()}
                <StatusBar backgroundColor="#0000FF" />
                <Loader loading={this.state.loading} text={this.state.loaderText} />
                {this.state.showHideImage && !this.state.showPdf ?
                    <View style={{ flex: 1, bottom: 40, }}>
                        <ScrollView keyboardShouldPersistTaps={'handled'}>
                            <ImageZoom
                                cropWidth={Dimensions.get('window').width}
                                cropHeight={Dimensions.get('window').height}
                                imageWidth={400}
                                imageHeight={300}
                                onClick={this.handleBackButtonClick}
                            >
                                <Image style={{ width: 400, height: 300 }}
                                    source={{ uri: this.state.docPath }}
                                    resizeMode={'contain'}
                                />
                            </ImageZoom>
                        </ScrollView>
                    </View>
                    : <View></View>}
                {this.state.showPdf ?
                    <View style={styles.certificateViewContainer}>
                        <Card style={styles.cardContainer}>
                            <ScrollView keyboardShouldPersistTaps={'handled'}>
                                <View style={{ paddingTop: 10, height: Dimensions.get('window').height * 0.7 }}>
                                    <Pdf
                                        source={this.state.docPath}
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
                    : <View></View>}

                {this.state.otherData.fullname && !this.state.showHideImage && !this.state.showPdf ?
                    <View style={{ marginLeft: 10, marginRight: 10, }}>
                        <Card>
                            <CardItem>
                                <Grid>
                                    {/* <Text>#{key + 1}</Text> */}
                                    <Row>
                                        <Col>
                                            <Text>Submitted By</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.fullname} {this.state.otherData.l_name}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Request No</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col >
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.request_number}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Student Name</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.student_name}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Institute</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.institute ? this.state.otherData.institute : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Degree</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.degree_name ? this.state.otherData.degree_name : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Branch</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.branch_name_long ? this.state.otherData.branch_name_long : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Registration No</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.registration_no ? this.state.otherData.registration_no : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Passout Year</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.passout_year ? this.state.otherData.passout_year : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Name Of Recruiter</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.name_of_recruiter ? this.state.otherData.name_of_recruiter : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Offer/Joining Letter</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <TouchableOpacity onPress={() => this.showZoomedImage(this.state.otherData.offer_letter)}>
                                                {this.state.otherData.offer_letter ?
                                                    this.state.otherData.offer_letter.indexOf('pdf') > -1 ?
                                                        <Icon type="FontAwesome" name="file-pdf-o" style={{ color: '#0000FF', fontSize: 100, width: 100 }} />
                                                        :
                                                        <Image source={{ uri: this.state.otherData.offer_letter }} style={{ height: 100, width: 100, borderWidth: 1, borderColor: 'black' }} />

                                                    : <Text>-</Text>
                                                }
                                                {/* {this.state.otherData.offer_letter.indexOf('pdf') > -1 ?
                                                    <Icon type="FontAwesome" name="file-pdf-o" style={{ color: '#0000FF', fontSize: 100, width: 100 }} />
                                                    :
                                                    <Image source={{ uri: this.state.otherData.offer_letter }} style={{ height: 100, width: 100, borderWidth: 1, borderColor: 'black' }} />
                                                } */}
                                            </TouchableOpacity>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Submission Date & Time</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.payment_date_time ? this.state.otherData.payment_date_time : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#f4b826', marginTop: 10, margin: 0 }} />
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Payment Transaction Id</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.payment_transaction_id ? this.state.otherData.payment_transaction_id : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Payment Gateway Id</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.payment_gateway_id ? this.state.otherData.payment_gateway_id : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Mode</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.payment_mode ? this.state.otherData.payment_mode : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Amount</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.amount ? this.state.otherData.amount : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Payment Date & Time</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.payment_date_time ? this.state.otherData.payment_date_time : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#f4b826', marginTop: 10, margin: 0 }} />

                                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 3 }}>Document Verification Details :</Text>

                                    {this.state.verificationDetails.length > 0 && !this.state.showHideImage && !this.state.showPdf ? this.state.verificationDetails.map((data, key) => (
                                        <View style={{ marginLeft: 10, marginRight: 10, }}>
                                            <Card>
                                                {/* <Card style={{ height: 30 , borderWidth:0}}> */}
                                                <TouchableOpacity onPress={() => this.fnForShowHide(key)} style={{ justifyContent: 'center', flex: 1, height: 35 }}>
                                                    <Grid>
                                                        <Row>
                                                            <Col size={11} style={{ justifyContent: 'center' }}>
                                                                <Text style={{ fontWeight: '800', fontSize: 17, marginLeft: 10 }}>{data.document_type}</Text>
                                                            </Col>
                                                            <Col size={1} style={{ justifyContent: 'center' }}>
                                                                {!this.state.showHideCard && !this.state.keyToCheck === key ?
                                                                    <Icon type="FontAwesome" name="caret-right" />
                                                                    :
                                                                    <Icon type="FontAwesome" name="caret-down" />
                                                                }
                                                            </Col>
                                                        </Row>
                                                    </Grid>
                                                </TouchableOpacity>
                                                {/* </Card> */}
                                                {this.state.keyToCheck === key && this.state.showHideCard ?
                                                    <CardItem>
                                                        <Grid>
                                                            <Text>#{key + 1}</Text>
                                                            <Row>
                                                                <Col>
                                                                    <Text>Document Type</Text>
                                                                </Col>
                                                                <Col>
                                                                    <Text style={{ color: 'gray' }}>: {data.document_type}</Text>
                                                                </Col>
                                                            </Row>
                                                            <Row size={5} style={{ marginTop: 9 }}>
                                                                <Col>
                                                                    <Text>Uploaded File</Text>
                                                                </Col>
                                                                <Col>
                                                                    <TouchableOpacity onPress={() => this.showZoomedImage(data.document_path)}>
                                                                        {data.document_path.indexOf('pdf') > -1 ?
                                                                            <Icon type="FontAwesome" name="file-pdf-o" style={{ color: '#0000FF', fontSize: 100, width: 100 }} />
                                                                            :
                                                                            <Image source={{ uri: data.document_path }} style={{ height: 100, width: 100, borderWidth: 1, borderColor: 'black' }} />
                                                                        }
                                                                    </TouchableOpacity>
                                                                </Col>
                                                            </Row>
                                                            <Row style={{ marginTop: 9 }}>
                                                                <Col>
                                                                    <Text>Results Found</Text>
                                                                </Col>
                                                                <Col>
                                                                    <Text style={{ color: 'gray' }}>: {data.result_found_status}</Text>
                                                                </Col>
                                                            </Row>
                                                            <Row style={{ marginTop: 9 }}>
                                                                <Col>
                                                                    <Text>Remark</Text>
                                                                </Col>
                                                                <Col>
                                                                    <Text style={{ color: 'gray' }}>: {data.remark ? data.remark : '-'}</Text>
                                                                </Col>
                                                            </Row>
                                                            <Row style={{ marginTop: 9 }}>
                                                                <Col>
                                                                    <Text>Exam Name</Text>
                                                                </Col>
                                                                <Col>
                                                                    <Text style={{ color: 'gray' }}>: {data.exam_name_display ? data.exam_name_display : '-'}</Text>
                                                                </Col>
                                                            </Row>
                                                            <Row style={{ marginTop: 9 }}>
                                                                <Col>
                                                                    <Text>Semester</Text>
                                                                </Col>
                                                                <Col>
                                                                    <Text style={{ color: 'gray' }}>: {data.semester ? data.semester : '-'}</Text>
                                                                </Col>
                                                            </Row>
                                                            <Row style={{ marginTop: 9 }}>
                                                                <Col>
                                                                    <Text>Year</Text>
                                                                </Col>
                                                                <Col>
                                                                    <Text style={{ color: 'gray' }}>: {data.doc_year ? data.doc_year : '-'}</Text>
                                                                </Col>
                                                            </Row>
                                                        </Grid>
                                                    </CardItem>
                                                    : <View />}
                                            </Card>
                                        </View>
                                    )) : <View></View>
                                    }

                                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#f4b826', marginTop: 10, margin: 0 }} />
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Current Status</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.verification_status ? this.state.otherData.verification_status : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Status Last Updated Date & Time</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.updated_date_time ? this.state.otherData.updated_date_time : '-'}</Text>
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: 9 }}>
                                        <Col>
                                            <Text>Status Last Updated By</Text>
                                        </Col>
                                        <Text style={{ bottom: 2 }}>: </Text>
                                        <Col>
                                            <Text style={{ color: 'gray' }}>{this.state.otherData.username ? this.state.otherData.username : '-'}</Text>
                                        </Col>
                                    </Row>
                                </Grid>
                            </CardItem>
                        </Card>
                    </View>
                    : <View />}
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
    container: { flex: 1, padding: 16, paddingTop: 10, backgroundColor: '#fff' },
    head: { height: 50, backgroundColor: '#f1f8ff' },
    text: { margin: 6, textAlign: 'center' },
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
    console.log(state);

    return {
        accessToken: state.VerifierReducer.LoginData.accessToken,
        changedInstituteName: state.VerifierReducer.changedInstituteName,
        userType: state.VerifierReducer.LoginData.user_type
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ clearStore: clearTheStoreOnLogout }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(VerifierDetailsScreen)