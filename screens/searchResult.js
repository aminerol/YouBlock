import * as React from 'react';
import {
  Text,
  StyleSheet,
  View,
  FlatList
} from 'react-native';
import { BackHandler } from 'react-native';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import SearchVideoItem from '../components/searchVideoItem';
import data from '../data.json'

@withNavigation
export default class ResultScreen extends React.Component {
    static navigationOptions =({navigation})=> {
      return {
        title: navigation.getParam('text'),
      };
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
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <SearchVideoItem video={item}/>
            )}
            keyExtractor={item => item.id.toString()}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
          />
        </View>
      );
    }
}

const styles = StyleSheet.create({
    container: {
    },
});