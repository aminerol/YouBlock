import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';

import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import LocalStorage from '../services/localStorage';
import ActionSheet from './actionSheet'
import DoubleTap from './doubleTap'
import LogUtils from '../utils/LogUtils';
import YoutubeAPI from '../services/youtube';
import { BlockedStateContext } from '../Context/Blocked';
import connect from '../Context/connect';
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
var _ = require('lodash');
const { width, height } = Dimensions.get('window');


class SearchVideoItem extends PureComponent {

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
              <AnimatedIcon name="md-eye-off" size={50} color="#FF0000" style={imageStyles}/>
            </View>
          ) : (
            <View style={styles.overlay}>
              <AnimatedIcon name="md-lock" size={50} color="#FF0000" style={imageStyles}/>
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
              { count: 3, action: this._handleChannelBlocking }
            ]}
            >
            <View style={{flex: 1}}>
              <Image ref={component => { this.thumbnailImage = component; }} source={{ uri: video.thumbnail }}  style={{flex: 1,}} resizeMode='stretch'/>
              {this._renderOverlay()}
            </View>
          </DoubleTap>
        <View style={{flex: 2, paddingHorizontal: 10}}>
            <Text numberOfLines={2} includeFontPadding={false} ellipsizeMode='tail' style={styles.videoTitle}>{video.title}</Text>
            <Text numberOfLines={1} includeFontPadding={false} style={styles.videoStats}>
              {video.owner.name}
            </Text>
            <Text numberOfLines={2} includeFontPadding={false} style={styles.videoStats}>
              {video.publishedTime + ' • ' + video.views}
            </Text>
            <View style={{flexDirection: 'row', flex: 1, paddingTop: 2,}}>
              {
                this.state.isVideoBlocked ?
                  <Ionicons name="md-eye-off" size={20} color="#FF0000"/>
                :
                  <Ionicons name="md-eye" size={20} color="#606060"/>
              }
              <View style={{paddingHorizontal: 4}} />
              {
                this.state.isChannelBlocked ?
                  <Ionicons name="md-lock" size={18} color="#FF0000"/>
                :
                  <Ionicons name="md-unlock" size={18} color="#606060"/>
              }
            </View>
            
        </View>
        <View>
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

export default connect(BlockedStateContext, mapStateToProps, mapDispatchToProps)(SearchVideoItem)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    width,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  descContainer: {
      flexDirection: 'row',
      padding: 10
  },
  videoTitle: {
    fontFamily: 'Roboto-Regular',
    color: '#333333',
    fontSize: 14,
    lineHeight: parseInt(14 * 1.2, 10),
    paddingBottom: 2,
    textAlign: 'left'
  },
  videoDetails: {
      paddingHorizontal: 10,
      flex: 1.
  },
  videoStats: {
    fontFamily: 'Roboto-Regular',
    color: '#606060',
    fontSize: 12,
    paddingTop: 2,
    textAlign: 'left'
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
});