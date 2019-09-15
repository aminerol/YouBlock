import * as React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';
import SlidingPanel from 'react-native-sliding-up-down-panels';
import SearchLayout from 'react-navigation-addon-search-layout';
import { getNavBarHeight } from 'react-native-iphone-x-helper';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { Ionicons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');
import YoutubeAPI from '../services/youtube';
import VideoItem from '../components/videoItem';
var _ = require('lodash');

var slidingPanel = {};
const navHeight = getNavBarHeight();

export default class HomeScreen extends React.Component {

    constructor(props) { 
      super(props);
      this.state = {
        selectedIndex: 0,
        videos: [],
        count: 0,
        loading: true,
        loadingMore: false,
        refreshing: false,
        error: null
      };
      this.inProgressNetworkReq = false;
    }

    static navigationOptions = ({ navigation }) => ({
        headerLeft: (
            <View style={{flex:1, flexDirection:'row', justifyContent: 'center', paddingHorizontal: 10}}>
                <Image source={require('../assets/logo.png')} style={{width:100, height:30}} resizeMode='contain' />
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
                <BorderlessButton
                    onPress={() => {
                      const navHeight = getNavBarHeight();
                      if(navHeight === slidingPanel.state.heightAnim._value){
                        slidingPanel.onRequestClose();
                      }else{
                        slidingPanel.onRequestStart();
                      }                      
                    }}
                    style={{ marginRight: 15 }}>
                    <Ionicons
                      name="md-options"
                      size={Platform.OS === 'ios' ? 22 : 25}
                      color={SearchLayout.DefaultTintColor}/>
                </BorderlessButton>
            </View>
        ),
    });

    fetchData = () => {
      if (!this.inProgressNetworkReq) {
        this.inProgressNetworkReq = true;
        YoutubeAPI.getHomeVideos().then(videos => {
          var result = _.uniqBy([...this.state.videos, ...videos], 'id');
          this.setState((prevState, nextProps) => ({
            videos: result,
            loading: false,
            loadingMore: false,
            refreshing: false
          }));
          this.inProgressNetworkReq = false;
        }).catch(error => {
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
          this.fetchData();
        }
      );
    };

    _handleRefresh = () => {
      this.setState(
        {
          refreshing: true
        },
        () => {
          this.fetchData();
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

    componentDidMount() {
      this.fetchData();
    }

    handleSingleIndexSelect = (index) => {
      this.setState(prevState => ({ ...prevState, selectedIndex: index }))
    }
  
    render() {
      const navHeight = getNavBarHeight();
      const { selectedIndex } = this.state
      return (
        <View>
          <SlidingPanel
            ref={component => { 
              slidingPanel = component; 
            }}
            
            allowDragging = {false}
            allowAnimation = {false}
            panelPosition= "top"
            headerLayoutHeight = {100}
            headerLayout = { () =>
              {

                return !this.state.loading ? (
                  <View style={styles.headerLayoutStyle}>
                    <FlatList
                      data={this.state.videos}
                      renderItem={({ item }) => (
                        <VideoItem video={item} />
                      )}
                      keyExtractor={item => item.id.toString()}
                      // ListHeaderComponent={this._renderHeader}
                      ListFooterComponent={this._renderFooter}
                      onRefresh={this._handleRefresh}
                      refreshing={this.state.refreshing}
                      onEndReached={this._handleLoadMore}
                      onEndReachedThreshold={0.5}
                      initialNumToRender={10}
                    />
                  </View>
                ) : (
                  <View style={{ flex: 1, width, height, justifyContent: 'center', alignContent: 'center', }} >
                    <ActivityIndicator size="large" color={'#007aff'} />
                  </View>
                );
              }
            }
            slidingPanelLayout = { () => 
              <View style={styles.slidingPanelLayoutStyle}>
                <SegmentedControlTab
                  values={['Videos', 'Channels']}
                  selectedIndex={selectedIndex}
                  tabStyle={styles.tabStyle}
                  tabTextStyle={styles.tabTextStyle}
                  activeTabStyle={styles.activeTabStyle}
                  onTabPress={this.handleSingleIndexSelect}
                />
              </View>
            }
            AnimationSpeed = {500}
            slidingPanelLayoutHeight = {navHeight}
          />
        </View>
      );
    }
}

const styles = StyleSheet.create({
    headerLayoutStyle: {
      width, 
      height,
      paddingTop: 6,
    },
    slidingPanelLayoutStyle: {
      width,
      height: navHeight,
      backgroundColor: 'white', 
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: '10%'
    },
    tabTextStyle: {
      fontFamily: 'Roboto-Regular',
      color: '#333333', 
      fontSize: 16,
    },
    tabStyle: {
      borderColor: '#D52C43',
    },
    activeTabStyle: {
      backgroundColor: '#D52C43',
    },
});