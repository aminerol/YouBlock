import ResultScreen from './screens/searchResult';
import SearchScreen from './screens/search';
import HomeScreen from './screens/home';
import { fromRight } from 'react-navigation-transitions';
import {Image} from 'react-native';
import React, { Component } from 'react';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { createAppContainer, createStackNavigator, createBottomTabNavigator} from 'react-navigation';

const getTabBarIcon = (navigation, focused, tintColor) => {
  const { routeName } = navigation.state;
  let iconName;
  if (routeName === 'Home') {
    iconName = 'md-home';
  } else if (routeName === 'Settings') {
    iconName = 'ios-options';
  }
  return <Ionicons name={iconName} size={25} color={tintColor} />;
};

let SearchStack = createStackNavigator(
  {
    Feed: HomeScreen,
    Search: SearchScreen,
  },
  {
    initialRouteName: 'Feed',
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
  Feed: { screen: SearchStack},
  Result: ResultScreen,
});

let bottomTab = createBottomTabNavigator(
  {
    Home: {
      screen: MainStack,
      navigationOptions: {
        tabBarLabel: 'Home',
      },
    },
  },
  {
    defaultNavigationOptions: ({ navigation }) => {
      return {
        tabBarIcon: ({ focused, tintColor }) => getTabBarIcon(navigation, focused, tintColor),
      }
    },
    tabBarOptions: {
      activeTintColor: '#FF0000',
      inactiveTintColor: '#606060',
      labelStyle: {
        fontSize: 13,
        fontFamily: 'Roboto-Regular',
        color: '#606060', 
      }
    },
  }
)

const getCurrentRouteName = (navigationState) => {
  if (!navigationState) {
    return null
  }
  const route = navigationState.routes[navigationState.index]
  // dive into nested navigators
  if (route.routes) {
    return getCurrentRouteName(route)
  }
  return route.routeName
}

MainStack.navigationOptions = ({ navigation }) => {
  const currentScreen = getCurrentRouteName(navigation.state)
  let tabBarVisible = true;
  if (currentScreen == "Search") {
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
  };
};

const AppContainer = createAppContainer(bottomTab);

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
          <AppContainer />
        </ActionSheetProvider>
      )
    }
    return (
      <Image
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: 100, height: 100 }}
            source={require("./assets/splash.png")}
          />
    );
  }
}