import React, { Component, useEffect } from 'react';
import { createAppContainer, createStackNavigator, createBottomTabNavigator} from 'react-navigation';
import { ResultScreen, SearchScreen, HomeScreen, BlockedScreen} from '../Screens';
import { fromRight } from 'react-navigation-transitions';
import { Ionicons } from '@expo/vector-icons';


const getTabBarIcon = (navigation, focused, tintColor) => {
    const { routeName } = navigation.state;
    let iconName;
    if (routeName === 'Home') {
      iconName = 'md-home';
    } else if (routeName === 'Settings') {
      iconName = 'ios-options';
    } else if (routeName === 'Blocked') {
      iconName = 'md-filing';
    }
    return <Ionicons name={iconName} size={25} color={tintColor} />;
};

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

let MainStack = createStackNavigator(
    {
        Feed: HomeScreen,
        Search: SearchScreen,
        Result: ResultScreen,
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
  
const BlockedStack = createStackNavigator({
    Blocked: {
        screen: BlockedScreen,
    },
});
  
let BottomNavigator = createBottomTabNavigator({
    Home: {
        screen: MainStack,
        navigationOptions: {
            tabBarLabel: 'Home',
        },
    },
    Blocked: {
        screen: BlockedStack,
        navigationOptions: {
            tabBarLabel: 'Library',
        },
    }},
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

export default AppContainer = createAppContainer(BottomNavigator);