import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { BorderlessButton } from 'react-native-gesture-handler';


class ActionSheet extends Component {

    _blockVideo = (videoId) => {
        console.log('BlockVideo', videoId);
    };
    
    _blockChannel = (ChannelId) => {
        console.log('blockChannel', ChannelId);
    };

    _onOpenActionSheet = () => {
        const video = this.props.video;
        let options = ['Block Video', 'Block Channel', 'Cancel'];
        let cancelButtonIndex = 2;
        this.props.showActionSheetWithOptions(
        {
            options,
            cancelButtonIndex,
            textStyle: {
                fontFamily: 'Roboto-Regular',
                color: '#333333',
                fontSize: 15,
            },
            icons:[
                <MaterialIcons key={'visibility-off'} name={'visibility-off'} size={24} />, 
                <MaterialIcons key={'block'} name={'block'} size={24} />, 
                <MaterialIcons key={'close'} name='close' size={24} />
            ]
        },(buttonIndex) => {
            switch (buttonIndex) {
                case 0:
                    this._blockVideo(video.id);
                    break;
                case 1:
                    this._blockChannel(video.owner.id);
                    break;
            }
        }
        );
    };
    
    render() {
        return (
            <BorderlessButton>
                <Ionicons onPress={this._onOpenActionSheet} style={{ paddingHorizontal: 10}} name="md-more" size={25} color="#999999"/>
            </BorderlessButton>
        );
    }
}

export default connectActionSheet(ActionSheet);

const styles = StyleSheet.create({
});
