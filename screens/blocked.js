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
import { Ionicons } from '@expo/vector-icons';
import SearchLayout from 'react-navigation-search-layout';
import { getNavBarHeight } from 'react-native-platform-helper';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import SlidingPanel from 'react-native-sliding-panels';
import LocalStorage from '../services/localStorage';
import EmptyContent from '../Components/emptyContent';
import BlockedVideoItem from '../Components/blockedVideoItem';
import FlatListEx, {RefreshState} from '../Components/FlatList';
import Header from '../Components/Header'
import LogUtils from '../utils/LogUtils';
import BlockedChannelItem from '../Components/blockedChannelItem';
import BlockedTitleItem from '../Components/blockedTitleItem';
import TextInputEx from '../Components/TextInput';
import { useBlockedState } from '../Context/Blocked';
import countRenders from '../utils/countRender';

const { width, height } = Dimensions.get('window');
var _ = require('lodash');
let filterSlidingPanel = {};
let isfilterSlidingPanelOpen = false;
const navHeight = getNavBarHeight();

export default function BlockedScreen({navigation}) {

    const [ {blockedVideos, blockedChannels, blockedTitles, loading, error}, actions ] = useBlockedState()

    //countRenders(BlockedScreen)

    const [ listState, setListState ] = useState(RefreshState.Idle)
    const [ currentItems, setCurrentItems ] = useState([])
    const [ selectedIndex, setSelectedIndex ] = useState(0)

    useLayoutEffect(() => {
        _.isEmpty(currentItems) && !loading ? setListState(RefreshState.EmptyData) : setListState(RefreshState.Idle)
    }, [currentItems])

    useLayoutEffect(() => {
        selectedIndex === 0 ? setCurrentItems(blockedVideos) : 
        selectedIndex === 1 ? setCurrentItems(blockedChannels) : 
        selectedIndex === 2 && setCurrentItems(blockedTitles)
    }, [selectedIndex, loading, blockedVideos, blockedChannels, blockedTitles])

    useLayoutEffect(() => {
        if(error){
            console.log('error fetching data', error)
            setListState(RefreshState.Failure)
        }
    }, [error])

    removeTitle = async (query) => {
        await LocalStorage.pop("blockedTitles", query)
    }

    _renderItem = ({item}) => (
        selectedIndex === 0 ? <BlockedVideoItem video={item}/> : 
        selectedIndex === 1 ? <BlockedChannelItem channel={item}/> : 
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
        if (selectedIndex === 2) {
            headline = 'No Titles Blocked'
            subHeadline = 'Go Ahead and add some titles to block. dont be shy'
        }
        if (selectedIndex === 1)
        {
            headline = 'No Channels Blocked'
            subHeadline = 'Go Ahead and Block some channels. dont be shy'
        }
        if (selectedIndex === 0)
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

    _renderBody = () =>{
        return !loading ? (
            <View style={styles.headerLayoutStyle}>
                <FlatListEx
                    data={currentItems}
                    renderItem={this._renderItem}
                    keyExtractor={(item, index) => item.id ? item.id + index : item.toString() + index}
                    ListHeaderComponent= {
                        selectedIndex === 2 && (
                            <View style={{marginBottom: 10}}>
                                <TextInputEx placeholderText="Add Title" onSubmit={async (query) => 
                                {
                                    if(!_.isEmpty(query))
                                    {
                                        await LocalStorage.push("blockedTitles", query, {isExist: true})
                                    }
                                }} />
                            </View>
                        )
                    }

                    refreshState={listState}
                    onHeaderRefresh={setListState}
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
                        selectedIndex={selectedIndex}
                        tabStyle={styles.tabStyle}
                        tabTextStyle={styles.tabTextStyle}
                        activeTabStyle={styles.activeTabStyle}
                        onTabPress={setSelectedIndex}
                    />
                </View>
            }
            AnimationSpeed = {500}
            slidingPanelLayoutHeight = {navHeight}
        />
    );
}

BlockedScreen.navigationOptions = ({ navigation }) => ({
    headerBackground: (
        <Header
            leftView={ <View style={{flex:0.2, flexDirection:'row', paddingHorizontal: 10,}}>
                            <Image source={require('../assets/images/logo.png')} style={{flex: 1, height:navHeight}} resizeMode='contain' />
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
