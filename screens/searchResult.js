import * as React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { BackHandler } from 'react-native';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import SearchVideoItem from '../components/searchVideoItem'
import EmptyContent from '../components/emptyContent';
import FlatListEx, {RefreshState} from '../components/FlatList';
import YoutubeAPI from '../services/youtube';
import LocalStorage from '../services/localStorage';
import { BlockedStateContext } from '../Context/Blocked';
import connect from '../Context/connect';
const { width, height } = Dimensions.get('window');
var _ = require('lodash');


@withNavigation
class ResultScreen extends React.Component {
    
    constructor(props){
      super(props);
      this.state = {
        loading: true,
        videos: [],
        error: null,
        listState: RefreshState.Idle,
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
          _.intersectionWith(result, this.props.blockedVideos, (x,y) => {
            _.merge(x, x.id === y.id && {'blocked': true})
          });
          _.intersectionWith(result, this.props.blockedChannels, (x,y) => {
            _.merge(x, x.owner.id === y.id && {'owner': {'blocked': true}})
          });

          let currentListState = {}
          if(pagination && _.isEmpty(videos)){
            currentListState = RefreshState.NoMoreData
          }else if (!pagination && _.isEmpty(videos)){
            currentListState = RefreshState.EmptyData
          }else{
            currentListState = RefreshState.Idle
          }

          this.setState({
            videos: result,
            loading: false,
            listState: currentListState,
          })

          this.inProgressNetworkReq = false;

        }).catch(error => {
          console.error(error);
          this.setState({loading: false, listState: RefreshState.Failure, error: error})
          this.inProgressNetworkReq = false;
        });
      }
    }

    _handleLoadMore = () => {
      this.setState({listState: RefreshState.FooterRefreshing}, ()=>{
        this.fetchData(true);
      })
      
    };

    _handleRefresh = () => {
      this.setState({listState: RefreshState.HeaderRefreshing}, ()=>{
        this.fetchData(false);
      })
      
    };

    _renderLoadingMore = () => {
      return (
        <ActivityIndicator style={{ margin: 10 }} size="large" color={'#007aff'} />
      )
    };

    _renderNoMoreData = () => {
      return (
        <Text style={styles.subHeadline}>
          No More Results
        </Text>
      )
    };

    _renderEmptyData = () => {
      return (
        <View style={{height}}>
          <EmptyContent headLine="No Results Found" subHeadLine="Try Diffrent keywords, or check your internet connection"/>
        </View>
      )
    };

    _renderItem = ({item}) => (
      <SearchVideoItem 
        video={item}
      />
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
                <FlatListEx
                  data={this.state.videos}
                  renderItem={this._renderItem}
                  keyExtractor={item => item.id.toString()}

                  refreshState={this.state.listState}
                  onHeaderRefresh={this._handleRefresh}
                  onFooterRefresh={this._handleLoadMore}

                  footerRefreshingComponent={this._renderLoadingMore()}
                  footerNoMoreDataComponent={this._renderNoMoreData()}
                  footerEmptyDataComponent={this._renderEmptyData()}
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

function mapStateToProps(state, ownProps){
  return {
    blockedVideos: state.blockedVideos,
    blockedChannels: state.blockedChannels,
  }
}

const wrappedComp = connect(BlockedStateContext, mapStateToProps)(ResultScreen)
wrappedComp.navigationOptions =({navigation})=> {
  return {
    title: navigation.getParam('searchText'),
  };
};
export default wrappedComp

const styles = StyleSheet.create({
    headerLayoutStyle: {
      flex: 1,
      paddingTop: 6,
    },
    subHeadline: {
      fontFamily: 'Roboto-Regular',
      color: '#606060',
      fontSize: 16,
      textAlign: 'center',
      padding: 10
    }
});