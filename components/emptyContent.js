import React, { PureComponent } from 'react';
import {  View, Text, StyleSheet, Image } from 'react-native';

export default class emptyContent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {headLine, subHeadLine} = this.props
    return (
      <View style={styles.container}>
        <Image source={require('../assets/conf.webp')} style={{ height: 200 }} resizeMode="contain" />
        <View style={{paddingVertical: 5}} />
        <Text style={styles.headline}> {headLine} </Text>
        <View style={{paddingVertical: 3}} />
        <Text style={styles.subHeadline}> {subHeadLine} </Text>
        <View style={{paddingVertical: 50}} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container : {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', 
    },
    headline: {
        fontFamily: 'Roboto-Medium',
        color: '#333333',
        fontSize: 24,
        textAlign: 'center',
    },
    subHeadline: {
        fontFamily: 'Roboto-Regular',
        color: '#606060',
        fontSize: 20,
        textAlign: 'center',
    }
})