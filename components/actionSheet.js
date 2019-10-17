import React, { Component } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { BorderlessButton } from 'react-native-gesture-handler';


class ActionSheet extends Component {

    _onOpenActionSheet = () => {
        const { options, childrens, actions, cancelButtonIndex} = this.props;
        this.props.showActionSheetWithOptions({
            options,
            cancelButtonIndex,
            textStyle: {
                fontFamily: 'Roboto-Regular',
                color: '#333333',
                fontSize: 15,
            },
            icons: childrens
        },(buttonIndex) => {
            if (actions.length > buttonIndex) {
                actions[buttonIndex]()
            }
        });
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