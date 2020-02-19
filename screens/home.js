import React, { useState, useEffect, useLayoutEffect, PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';
import SearchLayout from 'react-navigation-search-layout';
import { Ionicons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');
import YoutubeAPI from '../services/youtube';
import HomeVideoItem from '../components/homeVideoItem';
import EmptyContent from '../components/emptyContent';
import FlatListEx, {RefreshState} from '../components/FlatList';
import { getNavBarHeight } from 'react-native-platform-helper';
import LogUtils from '../utils/LogUtils';
import { BlockedStateContext } from '../Context/Blocked';
import countRenders from '../utils/countRender';
import connect from '../Context/connect';
var _ = require('lodash');

class HomeScreen extends PureComponent {

    constructor(props){
      super(props)
      this.inProgressNetworkReq = false
      this.state = {
        videos: [],
        loading: true,
        listState: RefreshState.Idle,
        error: null
      }
    }
  
    componentDidMount() {
      this.fetchData(false, false);
    }

    fetchData = (pagination, isReload) => {
      if (!this.inProgressNetworkReq) {
        this.inProgressNetworkReq = true;
        YoutubeAPI.getHomeVideos(pagination, isReload).then(homeResults => {

          var result = _.uniqBy([...this.state.videos, ...homeResults], 'id');

          _.intersectionWith(result, this.props.blockedVideos, (x,y) => {
            _.merge(x, x.id === y.id && {'blocked': true})
          });
          _.intersectionWith(result, this.props.blockedChannels, (x,y) => {
            _.merge(x, x.owner.id === y.id && {'owner': {'blocked': true}})
          });

          let currentListState = {}
          if(pagination && _.isEmpty(homeResults)){
            currentListState = RefreshState.NoMoreData
          }else if (!pagination && _.isEmpty(homeResults)){
            currentListState = RefreshState.EmptyData
          }else{
            currentListState = RefreshState.Idle
          }

          this.setState({
            videos: result,
            loading: false,
            listState: currentListState
          })
          this.inProgressNetworkReq = false;

        }).catch(error => {
          console.error(error);
          this.setState({
            error: error,
            loading: false,
            listState: RefreshState.Failure
          })
          this.inProgressNetworkReq = false;
        });
      }
    }

    _handleLoadMore = () => {
      this.setState({listState: RefreshState.FooterRefreshing}, () => {
        this.fetchData(true, false);
      })
    };

    _handleRefresh = () => {
      this.setState({listState: RefreshState.HeaderRefreshing}, () => {
        this.fetchData(false, true);
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
          <EmptyContent headLine="No Videos Found" subHeadLine="Try Reload this page, or check your internet connection"/>
        </View>
      )
    };

    _renderItem = ({item}) => (
      <HomeVideoItem  video={item}/>
    );

    render(){
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

function mapStateToProps(state, ownProps){
  return {
    blockedVideos: state.blockedVideos,
    blockedChannels: state.blockedChannels,
  }
}

const wrappedComp = connect(BlockedStateContext, mapStateToProps)(HomeScreen)
wrappedComp.navigationOptions = ({ navigation }) => ({
  headerLeft: (
      <View style={{flex:1, flexDirection:'row', justifyContent: 'center', paddingHorizontal: 10}}>
          <Image source={require('../assets/images/logo.png')} style={{width:100, height:getNavBarHeight()}} resizeMode='contain' />
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