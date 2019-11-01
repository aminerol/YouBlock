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
import SearchVideoItem from '../components/searchVideoItem';
import EmptyContent from '../components/emptyContent';
import FlatListEx, {RefreshState} from '../components/FlatList';
import YoutubeAPI from '../services/youtube';
import LocalStorage from '../services/localStorage';
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
        loading: true,
        videos: [],
        count: 0,
        error: null,
        listState: RefreshState.Idle,
      };
      this.inProgressNetworkReq = false;
    }

    componentWillMount() {
      BackHandler.addEventListener('hardwareBackPress', this.backButtonClick);

      this.focusListener = this.props.navigation.addListener('didFocus', () => {
        
        LocalStorage.get(["blockedVideos", "blockedChannels"]).then(blockedContent => {

          _.map(this.state.videos, (x)=>{
            _.update(x, 'blocked', (n)=>{ return false});
            _.update(x, 'owner.blocked', (n)=>{ return false});
          });

          _.intersectionWith(this.state.videos, blockedContent[0], (x,y) => {
            _.merge(x, x.id === y.id && {'blocked': true})
          });
          _.intersectionWith(this.state.videos, blockedContent[1], (x,y) => {
            _.merge(x, x.owner.id === y.id && {'owner': {'blocked': true}})
          });
          this.setState({
            videos: this.state.videos,
          })
        })
      });
    }
  
    componentWillUnmount(){
      this.focusListener.remove();
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
          LocalStorage.get(["blockedVideos", "blockedChannels"]).then(blockedContent => {
            
            _.intersectionWith(result, blockedContent[0], (x,y) => {
              _.merge(x, x.id === y.id && {'blocked': true})
            });
            _.intersectionWith(result, blockedContent[1], (x,y) => {
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
          })

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
        onVideoBlocked={(isblocked, id)=> {
          _.set(_.find(this.state.videos, ['id', id]), 'blocked', isblocked)
        }}
        onChannelBlocked={(isblocked, id)=> {
          _.set(_.find(this.state.videos, ['owner.id', id]), 'owner.blocked', isblocked)
        }}
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