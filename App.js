import React, { Component } from 'react';
import {Image} from 'react-native';
import * as Font from 'expo-font';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import AppContainer from './Navigation'
import { BlockedState } from './Context/Blocked'

if(__DEV__) {
  import("./ReactotronConfig")
}

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fontsLoaded: false
    };
  }

  async componentDidMount() {
    await this.loadFonts();
    this.setState(prevState => ({ ...prevState, fontsLoaded: true }));
  }

  async loadFonts() {
    await Font.loadAsync({
      "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
      "Roboto-Medium": require("./assets/fonts/Roboto-Medium.ttf"),
      "Roboto-Light": require("./assets/fonts/Roboto-Light.ttf"),
    });
  }

  render() {
    if (this.state.fontsLoaded) {
      return (
        <ActionSheetProvider>
          <BlockedState>
            <AppContainer />
          </BlockedState>
        </ActionSheetProvider>
      )
    }
    return (
      
      <Image
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: 100, height: 100 }}
            source={require("./assets/images/splash.png")}
          />
    );
  }
}