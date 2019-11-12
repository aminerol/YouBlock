import React, { useState, useEffect, useLayoutEffect } from 'react';
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
import HomeVideoItem from '../Components/homeVideoItem';
import EmptyContent from '../Components/emptyContent';
import FlatListEx, {RefreshState} from '../Components/FlatList';
import LocalStorage from '../services/localStorage';
import { getNavBarHeight } from 'react-native-platform-helper';
import LogUtils from '../utils/LogUtils';
import { useBlockedState } from '../Context/Blocked';
var _ = require('lodash');

export default function HomeScreen({navigation}) {

    const [ {blockedVideos, blockedChannels, blockedTitles}, actions ] = useBlockedState()

    const [ videos, setVideos ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ listState, setListState ] = useState(RefreshState.Idle)
    const [ error, setError ] = useState(RefreshState.Idle)
    let inProgressNetworkReq = false

    useLayoutEffect(() => {
      _.map(videos, (x) => _.update(x, 'blocked', () => false) );
      _.intersectionWith(videos, blockedVideos, (x,y) =>  _.merge(x, x.id === y.id && {'blocked': true}));
      setVideos(videos)
    }, [blockedVideos])

    useLayoutEffect(() => {
      _.map(videos, (x) => _.update(x, 'owner.blocked', () => false) );
      _.intersectionWith(videos, blockedChannels, (x,y) =>  _.merge(x, x.owner.id === y.id && {'owner': {'blocked': true}}));
      setVideos(videos)
    }, [blockedChannels])

    useEffect(() => {
      fetchData(false, false);
    }, [])

    useEffect(() => {
      if(listState == RefreshState.FooterRefreshing) 
        fetchData(true, false);

      if(listState == RefreshState.HeaderRefreshing) 
        fetchData(false, true);
    }, [listState])

    fetchData = (pagination, isReload) => {
      if (!inProgressNetworkReq) {
        inProgressNetworkReq = true;
        YoutubeAPI.getHomeVideos(pagination, isReload).then(homeResults => {

          var result = _.uniqBy([...videos, ...homeResults], 'id');

          _.intersectionWith(result, blockedVideos, (x,y) => {
            _.merge(x, x.id === y.id && {'blocked': true})
          });
          _.intersectionWith(result, blockedChannels, (x,y) => {
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

          setVideos(result)
          setLoading(false)
          setListState(currentListState)
          inProgressNetworkReq = false;

        }).catch(error => {
          console.error(error);
          setError(error)
          setLoading(false)
          setListState(RefreshState.Failure)
          inProgressNetworkReq = false;
        });
      }
    }

    _handleLoadMore = () => {
      setListState(RefreshState.FooterRefreshing)
    };

    _handleRefresh = () => {
      setListState(RefreshState.HeaderRefreshing)
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
      <HomeVideoItem 
        video={item} 
        onVideoBlocked={(isblocked, id)=> {
          _.set(_.find(videos, ['id', id]), 'blocked', isblocked)
        }}
        onChannelBlocked={(isblocked, id)=> {
          _.set(_.find(videos, ['owner.id', id]), 'owner.blocked', isblocked)
        }}
      />
    );

    return (
      !loading ? (
        <View style={styles.headerLayoutStyle}>
            <FlatListEx
                data={videos}
                renderItem={this._renderItem}
                keyExtractor={item => item.id.toString()}

                refreshState={listState}
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

HomeScreen.navigationOptions = ({ navigation }) => ({
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