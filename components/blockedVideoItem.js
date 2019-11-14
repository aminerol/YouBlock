import React, { PureComponent, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated,} from 'react-native';

import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import ActionSheet from './actionSheet'
import DoubleTap from './doubleTap'
import LogUtils from '../utils/LogUtils';
import { BlockedStateContext } from '../Context/Blocked';
import connect from '../Context/connect';
import countRenders from '../utils/countRender';
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
var _ = require('lodash');

class BlockedVideoItem extends PureComponent {

  constructor(props){
    super(props)

    this.video = props.video
    this.animatedValue = new Animated.Value(0);
    this.state = {
      isVideoBlocked: true
    }
  }

  _handleVideoBlocking = () => {
    this.setState((state) => {
      const newBlocked = !state.isVideoBlocked;
      const mergedObject = _.merge({}, this.video, {type: 'video', 'blocked': newBlocked})
      if (newBlocked) {
        
        Animated.sequence([
          Animated.spring(this.animatedValue, { toValue: 1 }),
          Animated.spring(this.animatedValue, { toValue: 0 }),
        ]).start(()=> {
          this.props.blockVideo(mergedObject)
        });
      } else {
        this.props.unBlockVideo(mergedObject)
      }
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
    return (
      <View style={styles.container}>
          <DoubleTap 
            onTaps={[
              { count: 2, action: _.debounce(this._handleVideoBlocking, 100) },
            ]}
            >
            <View style={[styles.shadowsStyling, {paddingHorizontal: 5,}]}>
              <Image source={{ uri: this.video.thumbnail }} style={{ height: 200, borderRadius: 5 }} resizeMode="stretch" />
              {this._renderOverlay()}
            </View>
          </DoubleTap>
          <View style={styles.descContainer}>
              <Image source={{ uri: this.video.owner.thumbnail }} style={{ width: 50, height: 50, borderRadius: 25 }} />
              <View style={styles.videoDetails}>
                  <Text numberOfLines={2} includeFontPadding={false} style={styles.videoTitle}>{this.video.title}</Text>
                  <View style={{flexDirection: 'column', flex: 1, flexWrap: 'wrap'}}>
                    <Text numberOfLines={2} includeFontPadding={false} style={styles.videoStats}>
                      {this.video.views + ' • ' + this.video.owner.name}
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
                  _.debounce(this._handleVideoBlocking, 100), 
                ]                  
              }
            />
          </View>
      </View>
    )
  }
}

function mapStateToProps(state, ownProps){
  return {
    blockedVideos: state.blockedVideos
  }
}

function mapDispatchToProps(actions){
  return {
    blockVideo: actions.blockVideo,
    unBlockVideo: actions.unBlockVideo
  }

}

export default connect(BlockedStateContext, mapStateToProps, mapDispatchToProps)(BlockedVideoItem)

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