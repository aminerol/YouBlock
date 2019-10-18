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
import LocalStorage from '../services/localStorage';
var _ = require('lodash');


export default class SearchScreen extends React.Component {

    static navigationOptions =({})=> {
      return {
        header: null,
      };
    };
  
    state = {
      searchText: null,
      suggestions: []
    };
    
    componentWillMount = () => {
      LocalStorage.get("suggestions").then(suggestions => {
        const result = _.transform(suggestions, function(result, value) {
          result.push({'query': value, 'type': true});
        }, []);
        this.setState({ suggestions: result })
      })
    };
    
    _handleQueryChange = searchText => {
      if (searchText != '') {
        YoutubeAPI.getSuggestions(searchText).then(queries => {
          const result = _.transform(queries, function(result, value) {
            result.push({'query': value, 'type': false});
          }, []);
          this.setState({ suggestions: result })
        });
      }else{
        LocalStorage.get("suggestions").then(suggestions => {
          const result = _.transform(suggestions, function(result, value) {
            result.push({'query': value, 'type': true});
          }, []);
          this.setState({ suggestions: result })
        })
      }
      this.setState({ searchText });
    };

    _renderRightItemIcon = (iconName, onClick) => {
      return (
        <Touchable
          background={Touchable.Ripple('rgba(180, 180, 180, 1)', true)}
          style={{ flex: 0.1, justifyContent: 'center', alignItems: 'center'}}
          onPress={onClick}>
          <Ionicons
              name={iconName}
              size={24}
              color="#757575"/>
        </Touchable>
      )
    }

    _renderSuggestions = (searchText) => {
      return (
        <View>
          <FlatList
            data={this.state.suggestions}
            renderItem={({ item }) => (
              <Touchable 
                onPress={() => {
                  LocalStorage.push("suggestions", item.query, true)
                  this.searchBar._handleChangeQuery(item.query);
                  this.props.navigation.navigate('Result', {
                    searchText: item.query,
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
                      <Text style={styles.suggestionText}>{item.query}</Text>
                    </View>
                    { !item.type ? 
                        this._renderRightItemIcon("md-create", () => {
                          this.searchBar._handleChangeQuery(item.query);
                          this.searchBar.setState({
                            q: item.query
                          })
                        }) 
                      :
                        this._renderRightItemIcon("md-close", () => {
                          LocalStorage.pop("suggestions", item.query)
                            .then(x => LocalStorage.get('suggestions')
                            .then((suggestions) => { 

                              const result = _.transform(suggestions, function(result, value) {
                                result.push({'query': value, 'type': true});
                              }, []);
                              this.setState({ suggestions: result })
                            }));
                        })
                    }
                  </>
              </Touchable>
            )}
            keyExtractor={item => item.query.toString()}
            initialNumToRender={10}
          />
        </View>
      )
    }

    onSubmit = (searchText) =>{
      if(!_.isEmpty(searchText)){
        LocalStorage.push("suggestions", searchText, true)
        this.props.navigation.navigate('Result', {
          searchText: searchText,
        })
      }
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
          onSubmit={this.onSubmit}
          onClearQuery={()=>{
            LocalStorage.get("suggestions").then(suggestions => {
              const result = _.transform(suggestions, function(result, value) {
                result.push({'query': value, 'type': true});
              }, []);
              this.setState({ suggestions: result })
            })
          }}
        >
          {this._renderSuggestions(searchText)}
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
