import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';

import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import LocalStorage from '../services/localStorage';
import ActionSheet from './actionSheet'
import DoubleTap from './doubleTap'
import LogUtils from '../utils/LogUtils';
import YoutubeAPI from '../services/youtube';
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
import ContentLoader from 'react-native-easy-content-loader';
import connect from '../Context/connect';
import { BlockedStateContext } from '../Context/Blocked';
var _ = require('lodash');
const { width, height } = Dimensions.get('window');


class BlockedChannelItem extends PureComponent {

  animatedValue = new Animated.Value(0);

  constructor(props) {
    super(props);
    this.channel = this.props.channel;
    
    this.state = {
      isChannelBlocked: true,
      subscriberCount: this.channel.subscriberCount,
      videoCount: this.channel.videoCount
    }
  }

  componentWillReceiveProps(nextProps, nextState){
    this.setState({subscriberCount: nextProps.channel.subscriberCount, videoCount: nextProps.channel.videoCount})
  }
  
  _handleChannelBlocking = () => {
    this.setState((state) => {
      const newBlocked = !state.isChannelBlocked;
      if (newBlocked) {
        
        Animated.sequence([
          Animated.spring(this.animatedValue, { toValue: 1 }),
          Animated.spring(this.animatedValue, { toValue: 0 }),
        ]).start(()=>{
          this.props.blockChannel(this.channel)
          YoutubeAPI.getChannelInfo(this.channel.id).then(async channelInfo => {
            mergedObject = {...this.channel, videoCount: channelInfo.videoCount, subscriberCount: channelInfo.subscriberCount, thumbnail: channelInfo.thumbnail}
            this.props.updateChannel(this.channel, mergedObject)
          })
        });
      } else {
        this.props.unBlockChannel(this.channel)
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
    return (
        <View style={styles.overlay}>
          <AnimatedIcon name="md-lock" size={25} color="#FF0000" style={imageStyles}/>
        </View>
      )
  }

  render() { 
    return (
      <View style={styles.container}>
          <ContentLoader 
              active
              avatar 
              aSize={110} 
              pRows={2}
              tHeight={10}
              loading={this.state.subscriberCount ? false: true}
              containerStyles={{
                marginHorizontal: 20,
              }}
              titleStyles={{
                marginHorizontal: 40,
                marginTop: 30,
              }}
              paragraphStyles={{
                marginHorizontal: 40,
                width: '35%'
            }}>
            <DoubleTap 
              onTaps={[
                { count: 2, action: this._handleChannelBlocking }
              ]}
              >
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Image source={{ uri: this.channel.thumbnail }} style={{width: 100, height: 100, borderRadius: 50,}} resizeMode="cover" />
                {this._renderOverlay()}
              </View>
            </DoubleTap>
            <View style={{flex: 2, padding: 20}}>
              <Text numberOfLines={2} includeFontPadding={false} ellipsizeMode='tail' style={styles.videoTitle}>{this.channel.name}</Text>
              <Text numberOfLines={2} includeFontPadding={false} style={styles.videoStats}>
                {
                  this.state.subscriberCount == -1 ? this.state.videoCount + ' videos'
                  : this.state.subscriberCount + ' subscribers • ' + this.state.videoCount + ' videos'
                }
              </Text>
              <View style={{flexDirection: 'row', flex: 1, paddingTop: 2,}}>
                {
                  this.state.isChannelBlocked ?
                    <Ionicons name="md-lock" size={20} color="#FF0000"/>
                  :
                    <Ionicons name="md-unlock" size={20} color="#606060"/>
                }
              </View>
            </View>
            <View>
              <ActionSheet 
                cancelButtonIndex={2}
                options={
                  [ this.state.isChannelBlocked ? 'Unblock Channel' : 'Block Channel',
                    'Cancel'
                  ]
                }
                childrens={[
                  <MaterialIcons key={'lock'} name={'lock'} size={24} />,
                  <MaterialIcons key={'close'} name='close' size={24} />
                ]}
                actions={
                  [ 
                    this._handleChannelBlocking,
                  ]                  
                }
              />
          </View>
        </ContentLoader>
      </View>
    )
  }
}

function mapDispatchToProps(actions){
  return {
    blockChannel: actions.blockChannel,
    unBlockChannel: actions.unBlockChannel,
    updateChannel: actions.updateChannel
  }
}

export default connect(BlockedStateContext, null, mapDispatchToProps)(BlockedChannelItem)

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
    fontSize: 16,
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
    fontSize: 13,
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