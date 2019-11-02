import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Image, Animated,} from 'react-native';
import FastImage from 'react-native-fast-image'
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import LocalStorage from '../services/localStorage';
import ActionSheet from './actionSheet'
import DoubleTap from './doubleTap'
import LogUtils from '../utils/LogUtils';
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
var _ = require('lodash');

export default class BlockedVideoItem extends PureComponent {

  animatedValue = new Animated.Value(0);

  constructor(props) {
    super(props);
    this.video = this.props.video;
    this.state = {
      isVideoBlocked: true,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isVideoBlocked: nextProps.video.blocked,
    })
  }

  _handleVideoBlocking = () => {
    this.setState((state) => {
      const newBlocked = !state.isVideoBlocked;
      if (newBlocked) {
        LocalStorage.push("blockedVideos", this.video, {isExist: true, predicate: (item) => {return item.id === this.video.id}})
        Animated.sequence([
          Animated.spring(this.animatedValue, { toValue: 1 }),
          Animated.spring(this.animatedValue, { toValue: 0 }),
        ]).start();
      } else {
        LocalStorage.pop("blockedVideos", this.video.id, {path: 'id'})
      }
      this.props.onVideoBlocked(newBlocked, this.video.id);
      return { isVideoBlocked: newBlocked };
    });
  };
  

  _renderOverlay = () => {
    const imageStyles = [
      styles.overlayHeart,
      {
        opacity: this.animatedValue,
        transform: [
          {
            scale: this.animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1.5],
            }),
          },
        ],
      },
    ];
    return (
      <View style={styles.overlay}>
        <AnimatedIcon name="md-eye-off" size={100} color="#FF0000" style={imageStyles}/>
      </View>
    )
  }

  render() {
    const video = this.video;
    return (
      <View style={styles.container}>
          <DoubleTap 
            onTaps={[
              { count: 2, action: this._handleVideoBlocking },
            ]}
            >
            <View style={[styles.shadowsStyling, {paddingHorizontal: 5,}]}>
              <Image source={{ uri: video.thumbnail }} style={{ height: 200, borderRadius: 5 }} resizeMode="stretch" />
              {this._renderOverlay()}
            </View>
          </DoubleTap>
          <View style={styles.descContainer}>
              <Image source={{ uri: video.owner.thumbnail }} style={{ width: 50, height: 50, borderRadius: 25 }} />
              <View style={styles.videoDetails}>
                  <Text numberOfLines={2} includeFontPadding={false} style={styles.videoTitle}>{video.title}</Text>
                  <View style={{flexDirection: 'column', flex: 1, flexWrap: 'wrap'}}>
                    <Text numberOfLines={2} includeFontPadding={false} style={styles.videoStats}>
                      {video.views + ' • ' + video.owner.name}
                    </Text>
                    <View style={{flexDirection: 'row', flex: 1, paddingTop: 2,}}>
                      {
                        this.state.isVideoBlocked ?
                          <Ionicons name="md-eye-off" size={25} color="#FF0000"/>
                        :
                          <Ionicons name="md-eye" size={25} color="#606060"/>
                      }
                  </View>
                </View>
            </View>
            <ActionSheet 
              cancelButtonIndex={1}
              options={
                [ this.state.isVideoBlocked ? 'Unblock Video' : 'Block Video', 
                  'Cancel'
                ]
              }
              childrens={[
                <MaterialIcons key={'visibility-off'} name={'visibility-off'} size={24} />,
                <MaterialIcons key={'close'} name='close' size={24} />
              ]}
              actions={
                [ 
                  this._handleVideoBlocking, 
                ]                  
              }
            />
          </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 5,
  },
  descContainer: {
      flexDirection: 'row',
      padding: 10
  },
  videoTitle: {
    fontFamily: 'Roboto-Regular',
    color: '#333333',
    fontSize: 14,
    textAlign: 'left',
    lineHeight: parseInt(14 * 1.2, 10),
  },
  videoDetails: {
      paddingHorizontal: 10,
      flex: 1
  },
  videoStats: {
    fontFamily: 'Roboto-Regular',
    color: '#606060',
    fontSize: 12,
    textAlign: 'left',
    paddingTop: 2
  },
  overlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlayHeart: {
  },
  shadowsStyling: {
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0
    }
}
});