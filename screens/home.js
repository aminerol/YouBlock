import * as React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';
import SearchLayout from 'react-navigation-addon-search-layout';
import { Ionicons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');
import YoutubeAPI from '../services/youtube';
import HomeVideoItem from '../components/homeVideoItem';
import EmptyContent from '../components/emptyContent';
import FlatListEx, {RefreshState} from '../components/FlatList';
import LocalStorage from '../services/localStorage';
import { getNavBarHeight } from 'react-native-iphone-x-helper';
import LogUtils from '../utils/LogUtils';
var _ = require('lodash');

export default class HomeScreen extends React.Component {

    constructor(props) { 
      super(props);
      this.state = {
        videos: [],
        count: 0,
        loading: true,
        listState: RefreshState.Idle,
        error: null,
      };
      this.inProgressNetworkReq = false;
    }

    static navigationOptions = ({ navigation }) => ({
        headerLeft: (
            <View style={{flex:1, flexDirection:'row', justifyContent: 'center', paddingHorizontal: 10}}>
                <Image source={require('../assets/logo.png')} style={{width:100, height:getNavBarHeight()}} resizeMode='contain' />
            </View>
        ),
        headerRight: (
            <View style={{flexDirection: 'row'}}>
                <BorderlessButton
                    onPress={() => {
                      navigation.navigate('Search')
                    }}
                    style={{ marginRight: 15 }}>
                    <Ionicons
                    name="md-search"
                    size={Platform.OS === 'ios' ? 22 : 25}
                    color={SearchLayout.DefaultTintColor}/>
                </BorderlessButton>
            </View>
        ),
    });

    componentDidMount() {
      this.fetchData(false, false);
    }

    fetchData = (pagination, isReload) => {
      if (!this.inProgressNetworkReq) {
        this.inProgressNetworkReq = true;
        YoutubeAPI.getHomeVideos(pagination, isReload).then(videos => {
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
      this.setState(
        {
          listState: RefreshState.FooterRefreshing
        },
        () => {
          this.fetchData(true, false);
        }
      );
    };

    _handleRefresh = () => {
      this.setState(
        {
          listState: RefreshState.HeaderRefreshing
        },
        () => {
          this.fetchData(false, true);
        }
      );
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
          <EmptyContent />
        </View>
      )
    };

    _renderItem = ({item}) => (
      <HomeVideoItem video={item} />
    );

    render() {
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