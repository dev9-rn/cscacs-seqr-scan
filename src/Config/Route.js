import { createStackNavigator, createAppContainer, createDrawerNavigator } from 'react-navigation';
import VerifierLoginScreen from '../Components/VerifierComponents/VerifierLoginScreen';
import VerifierSignupScreen from '../Components/VerifierComponents/VerifierSignupScreen';
import VerifierMainScreen from '../Components/VerifierComponents/VerifierMainScreen';
import InstituteLoginScreen from '../Components/InstituteComponents/InstituteLoginScreen';
import InstituteMainScreen from '../Components/InstituteComponents/InstituteMainScreen';
import HomeScreen from '../Components/HomeScreen';
import OTPVerification from '../Components/OTPVerification';
import AboutUs from '../Components/AboutUs';
import VerifierScanScreen from '../Components/VerifierComponents/VerifierScanScreen';
import RequestVerification from '../Components/VerifierComponents/Forms/RequestVerification';
import PricesTable from '../Components/VerifierComponents/Forms/PricesTable';
import VerifierStatusScreen from '../Components/VerifierComponents/VerifierStatusScreen';
import VerifierDetailsScreen from '../Components/VerifierComponents/VerifierDetailsScreen';
import NavigateScreen from './NavigateScreen';
import VerifierScanHistory from '../Components/VerifierComponents/History/VerifierScanHistory';
import VerifierScanHistoryDetails from '../Components/VerifierComponents/History/VerifierScanHistoryDetails';
import VerifierProfileScreen from '../Components/VerifierComponents/VerifierProfileScreen';
import InstituteScanScreen from '../Components/InstituteComponents/InstituteScanScreen';
import InstituteAuditScanScreen from '../Components/InstituteComponents/InstituteAuditScanScreen';
import InstituteAuditViewScreen from '../Components/InstituteComponents/InstituteAuditViewScreen';
import InstituteCertificateViewScreen from '../Components/InstituteComponents/InstituteCertificateViewScreen';
import InstituteCertificateAndPrint from '../Components/InstituteComponents/InstituteCertificateAndPrint';
import StudentLoginScreen from '../Components/StudentComponents/StudentLoginScreen';
import StudentSignupScreen from '../Components/StudentComponents/StudentSignupScreen';
import OTPVerificationForStudent from '../Components/StudentComponents/OTPVerificationForStudent';
import RemoveAccount from '../Components/RemoveAccount';
import CertificateViewScreen from '../Components/VerifierComponents/CertificateViewScreen';
import CertificateViewScreen1 from '../Components/VerifierComponents/CertificateViewScreen1';


const MainNavigator = createStackNavigator({
    VerifierLoginScreen: { screen: VerifierLoginScreen, navigationOptions: { header: null } },
    VerifierSignupScreen: { screen: VerifierSignupScreen, navigationOptions: { header: null } },
    VerifierMainScreen: { screen: VerifierMainScreen, navigationOptions: { header: null } },
    InstituteLoginScreen: { screen: InstituteLoginScreen, navigationOptions: { header: null } },
    InstituteMainScreen: { screen: InstituteMainScreen, navigationOptions: { header: null } },
    HomeScreen: { screen: HomeScreen, navigationOptions: { header: null } },
    OTPVerification: { screen: OTPVerification, navigationOptions: { header: null } },
    AboutUs: { screen: AboutUs, navigationOptions: { header: null } },
    RemoveAccount: { screen: RemoveAccount, navigationOptions: { header: null } },
    VerifierScanScreen: { screen: VerifierScanScreen, navigationOptions: { header: null } },
    CertificateViewScreen: { screen: CertificateViewScreen, navigationOptions: { header: null } },
    CertificateViewScreen1: { screen: CertificateViewScreen1, navigationOptions: { header: null } },
    RequestVerification: { screen: RequestVerification, navigationOptions: { header: null } },
    PricesTable: { screen: PricesTable, navigationOptions: { header: null } },
    VerifierStatusScreen: { screen: VerifierStatusScreen, navigationOptions: { header: null } },
    VerifierDetailsScreen: { screen: VerifierDetailsScreen, navigationOptions: { header: null } },
    NavigateScreen: { screen: NavigateScreen, navigationOptions: { header: null } },
    VerifierScanHistory: { screen: VerifierScanHistory, navigationOptions: { header: null } },
    VerifierScanHistoryDetails: { screen: VerifierScanHistoryDetails, navigationOptions: { header: null } },
    VerifierProfileScreen: { screen: VerifierProfileScreen, navigationOptions: { header: null } },
    InstituteScanScreen: { screen: InstituteScanScreen, navigationOptions: { header: null } },
    InstituteAuditScanScreen: { screen: InstituteAuditScanScreen, navigationOptions: { header: null } },
    InstituteAuditViewScreen: { screen: InstituteAuditViewScreen, navigationOptions: { header: null } },
    InstituteCertificateViewScreen: { screen: InstituteCertificateViewScreen, navigationOptions: { header: null } },
    InstituteCertificateAndPrint: { screen: InstituteCertificateAndPrint, navigationOptions: { header: null } },
    StudentLoginScreen: { screen: StudentLoginScreen, navigationOptions: { header: null } },
    StudentSignupScreen: { screen: StudentSignupScreen, navigationOptions: { header: null } },
    OTPVerificationForStudent: { screen: OTPVerificationForStudent, navigationOptions: { header: null } },
},
    {
        defaultNavigationOptions: {
            gesturesEnabled: false,
        },
        initialRouteName: "NavigateScreen",
        headerMode: 'none',
    }
);
const Route = createAppContainer(MainNavigator);
export default Route;