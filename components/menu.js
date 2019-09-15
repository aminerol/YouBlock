//This is an example code for the popup menu//
import React, { Component } from 'react';
//import react in our code.
import { View, Text,Image, TouchableOpacity  } from 'react-native';
//import all the components we are going to use.
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
//import menu and menu item

import { Ionicons } from '@expo/vector-icons';


export default class CustomMenu extends Component {
  _menu = null;
  setMenuRef = ref => {
    this._menu = ref;
  };
  showMenu = () => {
    this._menu.show();
  };
  hideMenu = () => {
    this._menu.hide();
  };
  option1Click = () => {
    this._menu.hide();
    this.props.option1Click();
  };
  option2Click = () => {
    this._menu.hide();
    this.props.option2Click();
  };
  option3Click = () => {
    this._menu.hide();
    this.props.option3Click();
  };
  option4Click = () => {
    this._menu.hide();
    this.props.option4Click();
  };
  render() {
    return (
      <View style={this.props.menustyle}>
        <Menu
          ref={this.setMenuRef}
          button={
            <Text onPress={this.showMenu}>Show menu</Text>
          }>
          <MenuItem onPress={this.option1Click}>op1:Go to second Page</MenuItem>
          <MenuItem onPress={this.option2Click}>op2:Demo Option</MenuItem>
          <MenuItem onPress={this.option3Click} disabled>
            op3:Disabled option
          </MenuItem>
          <MenuDivider />
          <MenuItem onPress={this.option4Click}>
            op4:Option After Divider
          </MenuItem>
        </Menu>
      </View>
    );
  }
}
