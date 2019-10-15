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
import SearchLayout from 'react-navigation-addon-search-layout';
import { Ionicons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');
import YoutubeAPI from '../services/youtube';
import HomeVideoItem from '../components/homeVideoItem';
var _ = require('lodash');


export default class HomeScreen extends React.Component {

    constructor(props) { 
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
            </View>
        ),
    });

    fetchData = (pagination) => {
      if (!this.inProgressNetworkReq) {
        this.inProgressNetworkReq = true;
        YoutubeAPI.getHomeVideos(pagination).then(videos => {
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
      <HomeVideoItem video={item} />
    );

    componentDidMount() {
      this.fetchData(false);
    }

    render() {
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

const styles = StyleSheet.create({
    headerLayoutStyle: {
      width, 
      height,
      paddingTop: 6,
    },
});