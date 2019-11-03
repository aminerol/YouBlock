import React, { PureComponent } from 'react';
import {  View, TextInput, StyleSheet, Platform } from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import SearchLayout from 'react-navigation-search-layout';

export default class TextInputEx extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
        text: ''
    };
  }

  _handleChangeText = text => {
    this.setState({ text });
    this.props.onChangeQuery && this.props.onChangeQuery(text);
  };

  _handleSubmit = () => {
    let { text } = this.state;
    this.props.onSubmit && this.props.onSubmit(text);
    this.setState({ text: '' });
  };

  render() {
    return (
        <View style={[styles.container, {borderBottomColor: this.props.borderBottomColor || 'grey', borderBottomWidth: this.props.borderBottomWidth || 1}]}>
          <TextInput
            placeholder={this.props.placeholderText || 'Search'}
            placeholderTextColor={this.props.placeholderTextColor || '#ccc'}
            value={this.state.text}
            autoCapitalize="none"
            onSubmitEditing={this._handleSubmit}
            onChangeText={this._handleChangeText}
            style={[styles.searchInput]}
          />
          <View style={{ width: 50, alignItems: 'center', justifyContent: 'center' }}>
                
                <BorderlessButton
                    onPress={this._handleSubmit}
                    style={{padding: 5}}>
                    <Ionicons
                        name="md-add"
                        size={Platform.OS === 'ios' ? 22 : 25}
                        color={SearchLayout.DefaultTintColor}
                    />
                </BorderlessButton>
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({

    container: {
        flexDirection: 'row',
        margin: 8
      },
      searchInput: {
        flex: 1,
        fontSize: 18,
        marginBottom: 2,
        paddingLeft: 5,
        marginRight: 5,
        
      },

})
