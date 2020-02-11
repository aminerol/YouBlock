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
import connect from '../Context/connect';
import { BlockedStateContext } from '../Context/Blocked'
import countRenders from '../utils/countRender';

const { width, height } = Dimensions.get('window');
var _ = require('lodash');
let filterSlidingPanel = {};
let segmentedControlTab = {}
let header = {}
let searchBar = {}
let isfilterSlidingPanelOpen = false;
const navHeight = getNavBarHeight();

class BlockedScreen extends PureComponent {

    constructor(props) {
        super(props);
        this.lastQuery = ''
        this.state = {
            selectedIndex: 0,
            listState: RefreshState.Idle,
            filtredItems: [],
            searchMode: false
        };
    }

    componentDidMount(){
        this.props.navigation.setParams({
            handleSearch: this.handleSearch,
            openSearchMode: () => {
                this.setState({filtredItems: this._getCurrentItems()})
                this.setState({searchMode: true})
            },
            closeSearchMode: () => { 
                this.lastQuery = ''
                header.slidingPanel.onRequestStart(()=>{
                    filterSlidingPanel.onRequestClose(()=>{
                        this.setState({searchMode: false, filtredItems: []})
                    }); 
                }) 
            },
            handleClearSearch : () => {
                this.lastQuery = ''
                this.setState({filtredItems: this._getCurrentItems()})
            }
        })
        this.fetchData();
    }

    componentDidUpdate(prevState, snapshot){
        this.flatList && this.setState({
            listState: _.isEmpty(this.flatList.props.data) ? RefreshState.EmptyData : RefreshState.Idle,
        })
    }

    fetchData = async () => {
        await this.props.getBlockedContent()
    }

    handleSearch = (query, index) => {
        this.lastQuery = query
        const itemsToSearch = this._getCurrentItems(index)
        filtredItems = itemsToSearch.filter((item) => {
            let title = item.title ? item.title : item.name ? item.name : item
            return title.toLowerCase().indexOf(query.toLowerCase()) !== -1
        })
        this.setState({ filtredItems: _.isEmpty(query) ? itemsToSearch : filtredItems, selectedIndex: index })
    }

    handleSingleIndexSelect = (index) => {
        if(this.state.searchMode){
            this.handleSearch(this.lastQuery, index)    
        }else{
            this.setState({
                selectedIndex: index
            })
        }
    }

    removeTitle = (query) => {
        this.props.unBlockTitle(query)
    }

    _renderItem = ({item}) => (
        this.state.selectedIndex === 0 ? <BlockedVideoItem video={item}/> : 
        this.state.selectedIndex === 1 ? <BlockedChannelItem channel={item}/> : 
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

    _getCurrentItems(index = this.state.selectedIndex){
        return index === 0 ? this.props.blockedVideos : 
                index === 1 ? this.props.blockedChannels : 
            this.props.blockedTitles
    }

    _renderSearchResults = () => {
        return (
            <View style={styles.headerLayoutStyle}>
                <FlatListEx
                    data={this.state.filtredItems}
                    renderItem={this._renderItem}
                    keyExtractor={(item) => item.id ? item.id.toString() : item.toString()}
                    refreshState={this.state.listState}
                    onHeaderRefresh={this._handleRefresh}
                    footerContainerStyle={{height: navHeight*1.5}}

                    footerNoMoreDataComponent={this._renderNoMoreData()}
                    footerEmptyDataComponent={this._renderEmptyData()}

                    initialNumToRender={10}
                />
            </View>
        )
    }

    _renderBody = () =>{
        return !this.props.loading ? (
            <View style={styles.headerLayoutStyle}>
                {this.state.selectedIndex === 2 && (
                    <View style={{marginBottom: 10}}>
                        <TextInputEx placeholderText="Add Title" onSubmit={(query) => 
                        {
                            if(!_.isEmpty(query))
                            {
                                this.props.blockTitle(query)
                            }
                        }} />
                    </View>
                )}
                <FlatListEx
                    ref={ref => this.flatList = ref}
                    data={this._getCurrentItems()}
                    renderItem={this._renderItem}
                    keyExtractor={(item) => item.id ? item.id.toString() : item.toString()}

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
                headerLayout = {this.state.searchMode ? this._renderSearchResults : this._renderBody}
                slidingPanelLayout = { () => 
                    <View style={styles.slidingPanelLayoutStyle}>
                        <SegmentedControlTab
                            ref={ref => segmentedControlTab = ref}
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

function mapStateToProps(state, ownProps){
    return {
        blockedVideos: state.blockedVideos,
        blockedChannels: state.blockedChannels,
        blockedTitles: state.blockedTitles,
        loading: state.loading,
        error: state.error,
    }
}
function mapDispatchToProps(actions){
    return {
        getBlockedContent: actions.getBlockedContent,
        blockTitle: actions.blockTitle,
        unBlockTitle: actions.unBlockTitle
    }
}

const wrappedComp = connect(BlockedStateContext, mapStateToProps, mapDispatchToProps)(BlockedScreen)
wrappedComp.navigationOptions = ({ navigation }) => ({
    headerBackground: (
        <Header
            ref={component => { 
                header = component; 
            }}
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
                                    header.slidingPanel.onRequestClose()
                                    filterSlidingPanel.onRequestStart();
                                    navigation.state.params.openSearchMode()
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
                        ref={ searchLayout => {
                            searchBar = searchLayout
                        }}
                        onBackButtonPressed={ () => {
                            searchBar.setState({ q: '' })
                            navigation.state.params.closeSearchMode()                                  
                        }}
                        text=''
                        onChangeQuery={(query) => {
                            navigation.state.params.handleSearch(query, segmentedControlTab.props.selectedIndex)
                        }}
                        onSubmit={this.onSubmit}
                        onClearQuery={() => {
                            navigation.state.params.handleClearSearch()
                        }}
                    >
                    </SearchLayout>
                </View>
        </Header>
    )
});
export default wrappedComp

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
