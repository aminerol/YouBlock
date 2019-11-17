import React, { PureComponent, useState, useLayoutEffect, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Animated} from 'react-native';

import { MaterialIcons, Ionicons } from '@expo/vector-icons';
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

import LocalStorage from '../services/localStorage';
import YoutubeAPI from '../services/youtube';
import LogUtils from '../utils/LogUtils';
import ActionSheet from './actionSheet'
import DoubleTap from './doubleTap'
import { BlockedStateContext } from '../Context/Blocked';
import countRenders from '../utils/countRender';
import connect from '../Context/connect';
var _ = require('lodash');

class HomeVideoItem extends PureComponent {

  animatedValue = new Animated.Value(0);

  constructor(props) {
    super(props);
    this.video = this.props.video;
    this.curentOverlay  = 'none';
    this.state = {
      isVideoBlocked: this.video.blocked,
      isChannelBlocked: this.video.owner.blocked
    }
  }

  componentWillReceiveProps(nextProps, nextState){
    this.setState({
      isVideoBlocked: nextProps.blockedVideos.some(item => item.id === this.video.id),
      isChannelBlocked: nextProps.blockedChannels.some(item => item.id === this.video.owner.id)
    })
  }

  _handleVideoBlocking = () => {
    this.setState((state) => {
      this.curentOverlay = 'video';
      const newBlocked = !state.isVideoBlocked;
      const mergedObject = _.merge({}, this.video, {type: 'video', 'blocked': newBlocked})
      if (newBlocked) {
        
        Animated.sequence([
          Animated.spring(this.animatedValue, { toValue: 1 }),
          Animated.spring(this.animatedValue, { toValue: 0 }),
        ]).start(()=>{
          this.props.blockVideo(mergedObject)
        });
      } else {
        this.props.unBlockVideo(mergedObject)
      }
      return { isVideoBlocked: newBlocked };
    });
  };

  _handleChannelBlocking = () => {
    this.setState((state) => {
      const newBlocked = !state.isChannelBlocked;
      this.curentOverlay = 'channel';
      const channel =  { ...this.video.owner, type: 'channel' }
      if (newBlocked) {
        
        Animated.sequence([
          Animated.spring(this.animatedValue, { toValue: 1 }),
          Animated.spring(this.animatedValue, { toValue: 0 }),
        ]).start(()=>{
          this.props.blockChannel(channel)
          YoutubeAPI.getChannelInfo(channel.id).then(async channelInfo => {
            const mergedObject = {...channel, videoCount: channelInfo.videoCount, subscriberCount: channelInfo.subscriberCount, thumbnail: channelInfo.thumbnail}
            this.props.updateChannel(channel, mergedObject)
          })
        });          
      } else {
        this.props.unBlockChannel(channel)
      }
      return { isChannelBlocked: newBlocked };
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

  render(){
    return (
      <View style={styles.container}>
          <DoubleTap 
            onTaps={[
              { count: 2, action: this._handleVideoBlocking },
              { count: 3, action: this._handleChannelBlocking }
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
                      {this.video.owner.name + '\u0009 • ' + this.video.views+ ' • ' + this.video.publishedTime}
                    </Text>
                    <View style={{flexDirection: 'row', flex: 1, paddingTop: 2,}}>
                      {
                        this.state.isVideoBlocked ?
                          <Ionicons name="md-eye-off" size={25} color="#FF0000"/>
                        :
                          <Ionicons name="md-eye" size={25} color="#606060"/>
                      }
                      <View style={{paddingHorizontal: 8}} />
                      {
                        this.state.isChannelBlocked ?
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
                  [ this.state.isVideoBlocked ? 'Unblock Video' : 'Block Video', 
                    this.state.isChannelBlocked ? 'Unblock Channel' : 'Block Channel',
                    'Cancel'
                  ]
                }
                childrens={[
                  <MaterialIcons key={'visibility-off'} name={'visibility-off'} size={24} />,
                  <MaterialIcons key={'lock'} name={'lock'} size={24} />,
                  <MaterialIcons key={'close'} name='close' size={24} />
                ]}
                actions={
                  [ this._handleVideoBlocking, 
                    this._handleChannelBlocking,
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
    blockedVideos: state.blockedVideos,
    blockedChannels: state.blockedChannels,
  }
}

function mapDispatchToProps(actions){
  return {
    blockVideo: actions.blockVideo,
    unBlockVideo: actions.unBlockVideo,
    blockChannel: actions.blockChannel,
    unBlockChannel: actions.unBlockChannel,
    updateChannel: actions.updateChannel
  }
}

export default connect(BlockedStateContext, mapStateToProps, mapDispatchToProps)(HomeVideoItem)

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