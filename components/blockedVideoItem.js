import React, { PureComponent, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated,} from 'react-native';

import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import ActionSheet from './actionSheet'
import DoubleTap from './doubleTap'
import LogUtils from '../utils/LogUtils';
import { useBlockedState } from '../Context/Blocked';
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
var _ = require('lodash');

export default function BlockedVideoItem(props) {

  let animatedValue = new Animated.Value(0);
  const video = props.video

  const [ {blockedVideos}, actions ] = useBlockedState()
  const [ isVideoBlocked, setIsVideoBlocked] = useState(true)

  useLayoutEffect(()=>{
    setIsVideoBlocked(blockedVideos.some(item => item.id === video.id))
  }, [blockedVideos])

  _handleVideoBlocking = () => {
    const newBlocked = !isVideoBlocked;
    const mergedObject = _.merge({}, video, {type: 'video', 'blocked': newBlocked})
    if (newBlocked) {
      actions.blockVideo(mergedObject)
      Animated.sequence([
        Animated.spring(animatedValue, { toValue: 1 }),
        Animated.spring(animatedValue, { toValue: 0 }),
      ]).start();
    } else {
      actions.unBlockVideo(mergedObject)
    }
    setIsVideoBlocked(newBlocked)
  };

  _renderOverlay = () => {
    const imageStyles = [
      styles.overlayHeart,
      {
        opacity: animatedValue,
        transform: [
          {
            scale: animatedValue.interpolate({
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

  return (
    <View style={styles.container}>
        <DoubleTap 
          onTaps={[
            { count: 2, action: _handleVideoBlocking },
          ]}
          >
          <View style={[styles.shadowsStyling, {paddingHorizontal: 5,}]}>
            <Image source={{ uri: video.thumbnail }} style={{ height: 200, borderRadius: 5 }} resizeMode="stretch" />
            {_renderOverlay()}
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
                      isVideoBlocked ?
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
              [ isVideoBlocked ? 'Unblock Video' : 'Block Video', 
                'Cancel'
              ]
            }
            childrens={[
              <MaterialIcons key={'visibility-off'} name={'visibility-off'} size={24} />,
              <MaterialIcons key={'close'} name='close' size={24} />
            ]}
            actions={
              [ 
                _handleVideoBlocking, 
              ]                  
            }
          />
        </View>
    </View>
  )
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