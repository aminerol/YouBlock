import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import OptionsMenu from "react-native-options-menu";
import FastImage from 'react-native-fast-image-expo'
import Menu, {MenuItem} from 'react-native-material-menu'

export default class VideoItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subjects: ['aaa', 'bbb']
    };
  }

  _blockVideo = () => {
    console.log('BlockVideo');
  };

  _blockChannel = () => {
    console.log('blockChannel');
  };

  showMenu = () => {
    this._menu.show();
  };
  hideMenu = () => {
    this._menu.hide();
  };

  render() {
    const video = this.props.video;
    return (
      <View style={styles.container}>
          <Image source={{ uri: video.thumbnail }} style={{ height: 200 }} />
          <View style={styles.descContainer}>
              <Image source={{ uri: video.owner.thumbnail }} style={{ width: 36, height: 36, borderRadius: 18 }} />
              <View style={styles.videoDetails}>
                  <Text numberOfLines={2} includeFontPadding={false} style={styles.videoTitle}>{video.title}</Text>
                  <View style={{flexDirection: 'row',}}>
                    <Text numberOfLines={1} includeFontPadding={false} style={styles.videoStats}>{video.owner.name}</Text>
                    <Text style={styles.videoStats}> • </Text>
                    <Text numberOfLines={1} includeFontPadding={false} style={styles.videoStats}>{video.views}</Text>
                    <Text style={styles.videoStats}> • </Text>
                    <Text numberOfLines={1} includeFontPadding={false} style={styles.videoStats}>{video.publishedTime}</Text>
                  </View>
              </View>
              <Menu
                ref={(component) => this._menu = component}
                button={
                  <Ionicons onPress={this.showMenu} style={styles.moreIcon} name="md-more" size={25} color="#999999"/>
                }>
                  <MenuItem onPress={this._blockVideo}>Block Video</MenuItem>
                  <MenuItem onPress={this._blockChannel}>Block Channel</MenuItem>
              </Menu>
          </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
    paddingBottom: 10,
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
  },
  videoDetails: {
      paddingHorizontal: 10,
      flex: 1
  },
  videoStats: {
    fontFamily: 'Roboto-Regular',
    color: '#606060',
    fontSize: 12,
    paddingTop: 2
  },
  moreIcon :{
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'red',
  }
});