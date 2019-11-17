import React, { PureComponent } from 'react';
import {  View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeout from 'react-native-swipeout';

export default class BlockedTitleItem extends PureComponent {
  constructor(props) {
    super(props);
    this.title = this.props.title
  }

  render() {
    const swipeBtns = [
        {
            component: ( <View style={styles.swipeBtn} >
                                <Ionicons name="md-trash" size={Platform.OS === 'ios' ? 22 : 25} color="#FF0000"/>
                            </View>
            ),
            backgroundColor: 'white',
            underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
            onPress: () => {
                this.props.onRemoveTitle(this.title)
            },
        }
      ];
    return (
        <Swipeout
            right={swipeBtns}
            autoClose={true}
            buttonWidth={70}
            >
                <View style={styles.li} >
                    <Text numberOfLines={1} style={styles.liText}>{this.title}</Text>
                </View>
        </Swipeout>
    );
  }
}

const styles = StyleSheet.create({
    li: {
        backgroundColor: '#fff',
        borderColor: '#eee',
        borderWidth: 1,
        borderTopWidth: 0,
        borderRightWidth: 0,
        paddingLeft: 16,
        paddingTop: 14,
        paddingBottom: 16,
    },
    liText: {
        fontFamily: 'Roboto-Regular',
        color: '#333333',
        fontSize: 16,
        textAlign: 'left'
    },
    swipeBtn: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column', 
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    }
})
