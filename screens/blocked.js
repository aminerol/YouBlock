import React, { PureComponent } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import SearchLayout from 'react-navigation-addon-search-layout';
import { getNavBarHeight } from 'react-native-iphone-x-helper';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import SlidingPanel from 'react-native-sliding-up-down-panels';
import LocalStorage from '../services/localStorage';
import EmptyContent from '../components/emptyContent';
import BlockedVideoItem from '../components/blockedVideoItem';
import FlatListEx, {RefreshState} from '../components/FlatList';
import Header from '../components/Header'
import LogUtils from '../utils/LogUtils';
import BlockedChannelItem from '../components/blockedChannelItem';
import BlockedTitleItem from '../components/blockedTitleItem';
import TextInputEx from '../components/TextInput';

const { width, height } = Dimensions.get('window');
var _ = require('lodash');
let filterSlidingPanel = {};
let isfilterSlidingPanelOpen = false;
const navHeight = getNavBarHeight();

export default class BlockedScreen extends PureComponent {

    static navigationOptions = ({ navigation }) => ({
        headerBackground: (
            <Header
                ref={component => { 
                    this.header = component; 
                }}
                leftView={ <View style={{flex:0.2, flexDirection:'row', paddingHorizontal: 10,}}>
                                <Image source={require('../assets/logo.png')} style={{flex: 1, height:navHeight}} resizeMode='contain' />
                            </View>
                }
                rightView={ <View style={{flexDirection: 'row',}}>
                                <BorderlessButton
                                    onPress={() => {
                                        if(isfilterSlidingPanelOpen){
                                            filterSlidingPanel.onRequestClose();
                                        }else{
                                            filterSlidingPanel.onRequestStart();
                                        }                      
                                    }}
                                    style={{justifyContent: 'center', paddingHorizontal: 10,}}>
                                    <Ionicons
                                        name="md-options"
                                        size={Platform.OS === 'ios' ? 22 : 25}
                                        color={SearchLayout.DefaultTintColor}
                                    />
                                </BorderlessButton>

                                <BorderlessButton
                                    onPress={() => {
                                        this.header.slidingPanel.onRequestClose()
                                    }}
                                    style={{justifyContent: 'center', paddingHorizontal: 10}}>
                                    <Ionicons
                                        name="md-search"
                                        size={Platform.OS === 'ios' ? 22 : 25}
                                    color={SearchLayout.DefaultTintColor}/>
                                </BorderlessButton>
                
                            </View>
                }
                backgroundColor='#fff'
                tintColor={Platform.OS === 'ios' ? '#007AFF' : '#000'}>
                    <View style={{width}}>
                        <SearchLayout
                            onBackButtonPressed={ () => {
                                this.header.slidingPanel.onRequestStart()
                            }}
                            text=''
                            onChangeQuery={(query) => {
                            }}
                            onSubmit={this.onSubmit}
                            onClearQuery={() => {
                            }}
                        >
                        </SearchLayout>
                    </View>
            </Header>
        )
    });

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: 0,
            loading: true,
            blockedVideos: [],
            blockedChannels: [],
            blockedTitles: [],
            currentItems: [],
            listState: RefreshState.Idle,
            error: null,
        };
    }

    componentWillMount = () => {
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.fetchData();
        });
    };

    componentWillUnmount() {
        this.focusListener.remove();
    }

    fetchData = () => {
        LocalStorage.get(["blockedVideos", "blockedChannels", "blockedTitles"]).then(results => {

            currentItems = [];
            if(this.state.selectedIndex === 0){
                currentItems = results[0];
            }
            if(this.state.selectedIndex === 1){
                currentItems = results[1];
            }
            if(this.state.selectedIndex === 2){
                currentItems = results[2];
            }
            this.setState({
                blockedVideos: results[0], 
                blockedChannels: results[1],
                blockedTitles: results[2],
                currentItems: currentItems,
                loading: false,
                listState: _.isEmpty(currentItems) ? RefreshState.EmptyData : RefreshState.Idle,
            })
        }).catch(error => {
            console.error(error);
            this.setState({loading: false, listState: RefreshState.Failure, error: error})
        });
    }

    handleSingleIndexSelect = (index) => {
        key = index === 0 ? "blockedVideos" : index=== 1 ? "blockedChannels" : "blockedTitles"
        LocalStorage.get(key).then(results =>{
            currentItems = results
            listState = _.isEmpty(results) ? RefreshState.EmptyData : RefreshState.Idle
            this.setState(prevState => ({ ...prevState, selectedIndex: index, listState: listState, currentItems: currentItems }))
        })      
    }

    removeTitle = async (query) => {
        await LocalStorage.pop("blockedTitles", query)
        this.fetchData();
    }

    onVideoBlocked = (isblocked, id) =>{
        _.set(_.find(this.state.currentItems, ['id', id]), 'blocked', isblocked)
    }

    _renderItem = ({item}) => (
        this.state.selectedIndex === 0 ? <BlockedVideoItem video={item} onVideoBlocked={this.onVideoBlocked}/> : 
        this.state.selectedIndex === 1 ? <BlockedChannelItem channel={item} onChannelBlocked={this.onVideoBlocked}/> : 
        <BlockedTitleItem title={item} onRemoveTitle={this.removeTitle}/>
    );

    _renderNoMoreData = () => {
        return (
          <Text style={styles.subHeadline}>
            No More Results
          </Text>
        )
    };
  
    _renderEmptyData = () => {
        if (this.state.selectedIndex === 2) {
            headline = 'No Titles Blocked'
            subHeadline = 'Go Ahead and add some titles to block. dont be shy'
        }
        if (this.state.selectedIndex === 1)
        {
            headline = 'No Channels Blocked'
            subHeadline = 'Go Ahead and Block some channels. dont be shy'
        }
        if (this.state.selectedIndex === 0)
        {
            headline = 'No Videos Blocked'
            subHeadline = 'Go Ahead and Block some videos. dont be shy'
        }
        return (
            <View style={{height}}>
                <EmptyContent headLine={headline} subHeadLine={subHeadline}/>
            </View>
        )
    };

    _handleRefresh = () => {
        this.setState(
          {
            listState: RefreshState.HeaderRefreshing,
          },
          () => {
            this.fetchData();
          }
        );
    };

    _renderBody = () =>{
        return !this.state.loading ? (
            <View style={styles.headerLayoutStyle}>
                <FlatListEx
                    data={this.state.currentItems}
                    renderItem={this._renderItem}
                    keyExtractor={(item) => item.id ? item.id.toString() : item.toString()}
                    ListHeaderComponent={
                        this.state.selectedIndex === 2 && (
                            <View style={{marginBottom: 10}}>
                                <TextInputEx placeholderText="Add Title" onSubmit={async (query) => 
                                {
                                    if(!_.isEmpty(query))
                                    {
                                        await LocalStorage.push("blockedTitles", query, true)
                                        this.fetchData()
                                    }
                                }} />
                            </View>
                        )
                    }

                    refreshState={this.state.listState}
                    onHeaderRefresh={this._handleRefresh}
                    footerContainerStyle={{height: navHeight*1.5}}

                    footerNoMoreDataComponent={this._renderNoMoreData()}
                    footerEmptyDataComponent={this._renderEmptyData()}

                    initialNumToRender={10}
                />
            </View>
            ) : (
            <View style={{ flex: 1, width, height, justifyContent: 'center', alignContent: 'center', }} >
                <ActivityIndicator size="large" color={'#007aff'} />
            </View>
        );
    }

    render() {
        const navHeight = getNavBarHeight();
        return (
            <SlidingPanel
                ref={component => { 
                    filterSlidingPanel = component; 
                }}
                allowDragging = {false}
                allowAnimation = {false}
                onAnimationStop = {() => isfilterSlidingPanelOpen = !isfilterSlidingPanelOpen}
                panelPosition= "top"
                headerLayoutHeight = {height}
                headerLayout = {this._renderBody}
                slidingPanelLayout = { () => 
                    <View style={styles.slidingPanelLayoutStyle}>
                        <SegmentedControlTab
                            values={['Videos', 'Channels', 'Titles']}
                            selectedIndex={this.state.selectedIndex}
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
        );
    }
}

const styles = StyleSheet.create({
    headerLayoutStyle: {
      width, 
      height: height - navHeight,
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
    subHeadline: {
        fontFamily: 'Roboto-Regular',
        color: '#606060',
        fontSize: 16,
        textAlign: 'center',
        padding: 10
    }
});
