import React, { Component } from 'react';
import { Root } from "native-base";
import { MenuProvider } from 'react-native-popup-menu';
import Route from './src/Config/Route';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { store, persistor } from './src/Config/store';


export default class App extends Component {
  render() {
    return (
      
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Root>
            <MenuProvider>
              <Route />
            </MenuProvider>
          </Root>
        </PersistGate>
      </Provider>
      
    )
  }
}
// export const URL = "http://192.168.0.5:808/raisoni/verify/functions/services/";

// export const URL = "https://raisoni.seqronline.com/verify/functions/services/";
// export const URLFORINSTITUTE = "https://raisoni.seqronline.com/services/";

export const URL = "https://demo.seqrdoc.com/api/verify/";
export const URLFORINSTITUTE = "https://demo.seqrdoc.com/api/";

export const APIKEY = "GSka~2nu@D,knVOfz{+/RL1WMF{bka";
export const INSTITUTE_NAME = 'Monad University';
export var scanQRData = [];
export var scanSeQRData = [];
export var ISNETCONNECTED = true;
export function setValue(newValue: Boolean) {
  ISNETCONNECTED = newValue;
}
export const APPNAME = "Demo SeQR Scan";