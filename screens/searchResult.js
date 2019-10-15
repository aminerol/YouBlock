import * as React from 'react';
import {
  Text,
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { BackHandler } from 'react-native';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import SearchVideoItem from '../components/searchVideoItem';
import YoutubeAPI from '../services/youtube';
const { width, height } = Dimensions.get('window');
var _ = require('lodash');


@withNavigation
export default class ResultScreen extends React.Component {
    static navigationOptions =({navigation})=> {
      return {
        title: navigation.getParam('searchText'),
      };
    };

    constructor(props){
      super(props);
      this.state = {
        videos: [],
        count: 0,
        loading: true,
        loadingMore: false,
        refreshing: false,
        error: null
      };
      this.inProgressNetworkReq = false;
    }

    componentWillMount() {
      BackHandler.addEventListener('hardwareBackPress', this.backButtonClick);
    }
  
    componentWillUnmount(){
      BackHandler.removeEventListener('hardwareBackPress', this.backButtonClick);
    }

    componentDidMount() {
      this.fetchData(false);
    }

    fetchData = (pagination) => {
      if (!this.inProgressNetworkReq) {
        this.inProgressNetworkReq = true;
        YoutubeAPI.search(this.props.navigation.getParam('searchText'), pagination).then(videos => {
          var result = _.uniqBy([...this.state.videos, ...videos], 'id');
          this.setState((prevState, nextProps) => ({
            videos: result,
            loading: false,
            loadingMore: false,
            refreshing: false
          }));
          this.inProgressNetworkReq = false;
        }).catch(error => {
          console.log(error);
          this.setState({ error, loading: false });
          this.inProgressNetworkReq = false;
        });
      }
    }

    _handleLoadMore = () => {
      this.setState(
        (prevState, nextProps) => ({
          loadingMore: true
        }),
        () => {
          this.fetchData(true);
        }
      );
    };

    _handleRefresh = () => {
      this.setState(
        {
          refreshing: true
        },
        () => {
          this.fetchData(false);
        }
      );
    };

    _renderFooter = () => {
      if (!this.state.loadingMore) return null;
      return (
        <View
          style={{
            position: 'relative',
            width: width,
            height: height,
            paddingVertical: 20,
            borderTopWidth: 1,
            marginTop: 10,
            marginBottom: 10,
            borderColor: '#E5E5E5'
          }}
        >
          <ActivityIndicator style={{ margin: 10 }} size="large" color={'#007aff'} />
        </View>
      );
    };

    _renderItem = ({item}) => (
      <SearchVideoItem video={item} />
    );

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
      {
        return (
          !this.state.loading ? (
            <View style={styles.headerLayoutStyle}>
              <FlatList
                data={this.state.videos}
                renderItem={this._renderItem}
                keyExtractor={item => item.id.toString()}
                ListFooterComponent={this._renderFooter}
                onRefresh={this._handleRefresh}
                refreshing={this.state.refreshing}
                onEndReached={this._handleLoadMore}
                onEndReachedThreshold={0.5}
                initialNumToRender={10}
              />
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}} >
              <ActivityIndicator size="large" color={'#007aff'} />
            </View>
          )
        )
      }
    }
}

const styles = StyleSheet.create({
    headerLayoutStyle: {
      width, 
      height,
      paddingTop: 6,
    },
});