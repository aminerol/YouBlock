import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image-expo'
import ActionSheet from './actionSheet'
const { width, height } = Dimensions.get('window');


export default class SearchVideoItem extends PureComponent {
  constructor(props) {
    super(props);
  }


  render() {
    const video = this.props.video;
    return (
      <View style={styles.container}>
        <Image source={{ uri: video.thumbnail }}  style={{width: 160, height: 100}}/>
        <View style={{flex: 2, paddingHorizontal: 10}}>
            <Text numberOfLines={3} includeFontPadding={false} ellipsizeMode='tail' style={styles.videoTitle}>{video.title}</Text>
            <Text numberOfLines={1} includeFontPadding={false} style={styles.videoStats}>
                {video.owner.name}
            </Text>
            <Text numberOfLines={1} includeFontPadding={false} style={styles.videoStats}>
                {video.publishedTime + ' • ' + video.views}
            </Text>
        </View>
        <View>
            <ActionSheet video={video}/>
        </View>
      </View>
    )
  }
}

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
  }
});