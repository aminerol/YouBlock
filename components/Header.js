import React from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { HeaderBackButton } from 'react-navigation';
import { getInset, getStatusBarHeight } from 'react-native-safe-area-view';
import { isIphoneX } from 'react-native-iphone-x-helper';
import SlidingPanel from 'react-native-sliding-up-down-panels'
const { width, height } = Dimensions.get('window');

// @todo: make this work properly when in landscape
const hasNotch = isIphoneX();

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 50 : 56;
const TITLE_OFFSET = Platform.OS === 'ios' ? 70 : 56;

const ANDROID_STATUS_BAR_HEIGHT = getStatusBarHeight ? getStatusBarHeight() : StatusBar.currentHeight;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? (hasNotch ? 40 : 25) : ANDROID_STATUS_BAR_HEIGHT;

export default class Header extends React.PureComponent {
  constructor(props) {
    super(props);

    // @todo: this is static and we don't know if it's visible or not on iOS.
    // need to use a more reliable and cross-platform API when one exists, like
    // LayoutContext. We also don't know if it's translucent or not on Android
    // and depend on react-native-safe-area-view to tell us.
    

    let platformContainerStyles;
    if (Platform.OS === 'ios') {
      platformContainerStyles = {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#A7A7AA',
      };
    } else {
      platformContainerStyles = {
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: StyleSheet.hairlineWidth,
        shadowOffset: {
          height: StyleSheet.hairlineWidth,
        },
        elevation: 4,
      };
    }

    this.styles = {
      container: {
        backgroundColor: '#fff',
        paddingTop: STATUSBAR_HEIGHT,
        height: STATUSBAR_HEIGHT + APPBAR_HEIGHT,
        ...platformContainerStyles,
      },
      appBar: {
        flex: 1,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      
    };
    this.state = {
      isVisible: false
    }

    this.isSlidingPanelOpen = false
  }

  componentDidMount(){
    this.slidingPanel.onRequestStart();
  }

  render() {
    let { styles } = this;
    let headerStyle = {};
    if (this.props.backgroundColor) {
      headerStyle.backgroundColor = this.props.backgroundColor;
    }

    return (
      <SlidingPanel
          ref={component => { 
            this.slidingPanel = component;
          }}
          allowDragging = {false}
          allowAnimation = {false}
          visible={this.state.isVisible}
          onAnimationStop = {() => {this.isSlidingPanelOpen = !this.isSlidingPanelOpen; this.setState({isVisible: true}) }}
          panelPosition= "left"
          headerLayoutWidth = {width}
          headerLayout = {() => 
            <View style={{width: width, height: STATUSBAR_HEIGHT + APPBAR_HEIGHT}}>
              {this.props.children}
            </View>
          }
          slidingPanelLayout = { () => 
            <Animated.View style={[{width}, styles.container, headerStyle]}>
              <View style={styles.appBar}>
                <View style={[styles.header]}>
                  {this.props.leftView}
                  {this.props.rightView}
                </View>
              </View>
            </Animated.View>

          }
          AnimationSpeed = {500}
          slidingPanelLayoutWidth= {width}
      />
    );
  }
}
