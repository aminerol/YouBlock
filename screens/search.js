import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchLayout from 'react-navigation-addon-search-layout';
import Touchable from 'react-native-platform-touchable';
import YoutubeAPI from '../services/youtube';


export default class SearchScreen extends React.Component {
    static navigationOptions = {
      header: null,
    };
  
    state = {
      searchText: null,
      suggestions: []
    };
  
    _handleQueryChange = searchText => {
      YoutubeAPI.getSuggestions(searchText).then(queries => this.setState({ suggestions: queries }));
      this.setState({ searchText });
    };
  
    _executeSearch = searchText => {
      console.log(searchText);
      
    };

    _renderSuggestions = (searchText) => {
      return (
        <View>
          <FlatList
            data={this.state.suggestions}
            renderItem={({ item }) => (
              <Touchable 
                onPress={() => {
                  this.searchBar._handleChangeQuery(item);
                  this.props.navigation.navigate('Result', {
                    text: item,
                  })
                }}
                style={styles.suggestionRow}
                background={Touchable.Ripple('rgba(180, 180, 180, 1)', false)} >

                  <>
                    <View style={{flex: 0.9, flexDirection: "row"}}>
                      <Ionicons
                        name="md-search"
                        size={24}
                        color="#757575"/>
                      <Text style={styles.suggestionText}>{item}</Text>
                    </View>


                    <Touchable
                      background={Touchable.Ripple('rgba(180, 180, 180, 1)', true)}
                      style={{ flex: 0.1, justifyContent: 'center', alignItems: 'center'}}
                      onPress={() => {
                        this.searchBar._handleChangeQuery(item);
                        this.searchBar.setState({
                          q: item
                        })
                      }}>
                      <Ionicons
                          name="md-create"
                          size={24}
                          color="#757575"/>
                    </Touchable>
                  </>
              </Touchable>
            )}
            keyExtractor={item => item.toString()}
            initialNumToRender={10}
          />
        </View>
      )
    }
  
    render() {
      let { searchText } = this.state;
      return (
        <SearchLayout
          ref={ searchLayout => {
            this.searchBar = searchLayout
          }}
          text={this.state.searchText}
          onChangeQuery={this._handleQueryChange}
          onSubmit={(searchText)=>{
            this.props.navigation.navigate('Result', {
              text: searchText,
            })
          }}
        >
          {searchText ? this._renderSuggestions(searchText) : null}
      </SearchLayout>
      );
    }
}

const styles = StyleSheet.create({
  suggestionRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 16,
  },
  suggestionText :{
    fontFamily: 'Roboto-Medium',
    color: '#757575', 
    fontSize: 16,
    paddingLeft: 25,    
  }
})
