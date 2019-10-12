import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import FastImage from 'react-native-fast-image-expo'
import ActionSheet from './actionSheet'

export default class HomeVideoItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const video = this.props.video;
    return (
      <View style={styles.container}>
          <Image source={{ uri: video.thumbnail }} style={{ height: 200 }} resizeMode="stretch" />
          <View style={styles.descContainer}>
              <Image source={{ uri: video.owner.thumbnail }} style={{ width: 36, height: 36, borderRadius: 18 }} />
              <View style={styles.videoDetails}>
                  <Text numberOfLines={2} includeFontPadding={false} style={styles.videoTitle}>{video.title}</Text>
                  <View style={{flexDirection: 'row', flex: 1}}>
                    <Text numberOfLines={2} includeFontPadding={false} style={styles.videoStats}>
                      {video.owner.name + ' • ' + video.views+ ' • ' + video.publishedTime}
                    </Text>
                  </View>
              </View>
              <ActionSheet video={video}/>
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
  }
});