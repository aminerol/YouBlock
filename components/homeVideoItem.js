import React, { PureComponent, useState, useLayoutEffect, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Animated} from 'react-native';

import { MaterialIcons, Ionicons } from '@expo/vector-icons';
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

import LocalStorage from '../services/localStorage';
import YoutubeAPI from '../services/youtube';
import LogUtils from '../utils/LogUtils';
import ActionSheet from './actionSheet'
import DoubleTap from './doubleTap'
import { useBlockedState } from '../Context/Blocked';
import countRenders from '../utils/countRender';
var _ = require('lodash');

export default function HomeVideoItem(props) {

  animatedValue = new Animated.Value(0);
  curentOverlay  = 'none';
  const video = props.video;

  countRenders(HomeVideoItem)

  const [ {blockedVideos, blockedChannels}, actions ] = useBlockedState()
  const [ isVideoBlocked, setIsVideoBlocked] = useState(video.blocked)
  const [ isChannelBlocked, setIsChannelBlocked] = useState(video.owner.blocked)
  
  useLayoutEffect(()=>{
    setIsVideoBlocked(blockedVideos.some(item => item.id === video.id))
  }, [blockedVideos])

  // useMemo(()=>{
  //   setIsChannelBlocked(blockedChannels.some(item => item.id === video.owner.id))
  // }, [blockedChannels])

  _handleVideoBlocking = () => {
    this.curentOverlay = 'video'
    const newBlocked = !isVideoBlocked;
    const mergedObject = _.merge({}, video, {type: 'video', 'blocked': newBlocked})

    if (newBlocked) {
      setIsVideoBlocked(true)
      actions.blockVideo(mergedObject)
      Animated.sequence([
        Animated.spring(animatedValue, { toValue: 1 }),
        Animated.spring(animatedValue, { toValue: 0 }),
      ]).start()
    } else {
      actions.unBlockVideo(mergedObject)
      setIsVideoBlocked(false)
    }
    
  };

  _handleChannelBlocking = () => {
    this.curentOverlay = 'channel'
    let mergedObject =  { ...video.owner, type: 'channel' }
    const newBlocked = !isChannelBlocked;
    if (newBlocked) {
      actions.blockChannel(mergedObject)
      Animated.sequence([
        Animated.spring(animatedValue, { toValue: 1 }),
        Animated.spring(animatedValue, { toValue: 0 }),
      ]).start();
      YoutubeAPI.getChannelInfo(mergedObject.id).then(async channelInfo => {
        mergedObject = {...mergedObject, videoCount: channelInfo.videoCount, subscriberCount: channelInfo.subscriberCount, thumbnail: channelInfo.thumbnail}
        await LocalStorage.set("blockedChannels", mergedObject.id, {path: 'id', newValue: mergedObject})
      })
    } else {
      actions.unBlockChannel(mergedObject)
    }
    setIsChannelBlocked(newBlocked)
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
    return this.curentOverlay == 'video' ? (
            <View style={styles.overlay}>
              <AnimatedIcon name="md-eye-off" size={100} color="#FF0000" style={imageStyles}/>
            </View>
          ) : (
            <View style={styles.overlay}>
              <AnimatedIcon name="md-lock" size={100} color="#FF0000" style={imageStyles}/>
            </View>
          )
  }

  return (
    <View style={styles.container}>
        <DoubleTap 
          onTaps={[
            { count: 2, action: _handleVideoBlocking },
            { count: 3, action: _handleChannelBlocking }
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
                    {video.owner.name + '\u0009 • ' + video.views+ ' • ' + video.publishedTime}
                  </Text>
                  <View style={{flexDirection: 'row', flex: 1, paddingTop: 2,}}>
                    {
                      isVideoBlocked ?
                        <Ionicons name="md-eye-off" size={25} color="#FF0000"/>
                      :
                        <Ionicons name="md-eye" size={25} color="#606060"/>
                    }
                    <View style={{paddingHorizontal: 8}} />
                    {
                      isChannelBlocked ?
                        <Ionicons name="md-lock" size={23} color="#FF0000"/>
                      :
                        <Ionicons name="md-unlock" size={23} color="#606060"/>
                    }
                  </View>
                </View>
            </View>
            <ActionSheet 
              cancelButtonIndex={2}
              options={
                [ isVideoBlocked ? 'Unblock Video' : 'Block Video', 
                  isChannelBlocked ? 'Unblock Channel' : 'Block Channel',
                  'Cancel'
                ]
              }
              childrens={[
                <MaterialIcons key={'visibility-off'} name={'visibility-off'} size={24} />,
                <MaterialIcons key={'lock'} name={'lock'} size={24} />,
                <MaterialIcons key={'close'} name='close' size={24} />
              ]}
              actions={
                [ _handleVideoBlocking, 
                  _handleChannelBlocking,
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