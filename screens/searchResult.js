import * as React from 'react';
import {
  Text,
  StyleSheet,
  View
} from 'react-native';
import { BackHandler } from 'react-native';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';

@withNavigation
export default class ResultScreen extends React.Component {
    static navigationOptions = {
      title: 'Result',
    };

    constructor(props){
      super(props);
    }

    componentWillMount() {
      BackHandler.addEventListener('hardwareBackPress', this.backButtonClick);
    }
  
    componentWillUnmount(){
      BackHandler.removeEventListener('hardwareBackPress', this.backButtonClick);
    }

    backButtonClick = () => {
      if(this.props.navigation){
        const resetAction = StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'Feed'})
          ]
        })
        this.props.navigation.dispatch(resetAction);
        return true;
      }
      return false;
    }
  
    render() {
      return (
        <View style={styles.container}>
          <Text>{this.props.navigation.getParam('text')} result!</Text>
        </View>
      );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
});