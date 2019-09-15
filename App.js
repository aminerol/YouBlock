import ResultScreen from './screens/searchResult';
import SearchScreen from './screens/search';
import HomeScreen from './screens/home';
import { fromRight } from 'react-navigation-transitions';
import {Image} from 'react-native';
import React, { Component } from 'react';
import * as Font from 'expo-font';

import { createAppContainer, createStackNavigator} from 'react-navigation';

let SearchStack = createStackNavigator(
  {
    Home: HomeScreen,
    Search: SearchScreen,
  },
  {
    initialRouteName: 'Home',
    transitionConfig: () => fromRight(),
    navigationOptions: {
      header: null,
    },
    defaultNavigationOptions: {
      gesturesEnabled: false,
    },
  }
);

let MainStack = createStackNavigator({
  Feed: SearchStack,
  Result: ResultScreen,
});
const AppContainer = createAppContainer(MainStack);

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
      return <AppContainer />
    }
    return (
      <Image
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: 100, height: 100 }}
            source={require("./assets/splash.png")}
          />
    );
  }
}