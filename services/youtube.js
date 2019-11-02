import LogUtils from '../utils/LogUtils';

var _ = require('lodash');
const millify = require('millify')
const API_KEY = 'AIzaSyDCU8hByM-4DrUqRUYnGn-3llEO78bcxq8';
const BASE_URL = 'https://youtubei.googleapis.com/youtubei/v1';

class youtubeAPI {
    constructor() {
        this.homeContinuationToken = '';
        this.homeReloadToken = '';
        this.searchContinuationToken = '';
        this.headers = new Headers({
            'User-Agent': 'com.google.android.apps.youtube.mango/2.29.52(Linux; U; Android 6.0.1; fr_FR; SM-G532F Build/MMB29T) gzip',
            'Content-Type': 'application/json',
            'X-GOOG-API-FORMAT-VERSION': '2',
            'X-Goog-Visitor-Id': ''
        });
    }

    status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.status))
        }
    }

    async getHomeVideos(pagination, isReload){
        try {
            if(!pagination)
                this.homeContinuationToken = '';
            if(isReload)
                this.homeContinuationToken = this.homeReloadToken;
            const response = await fetch(`${BASE_URL}/browse?key=${API_KEY}`, {
                method: 'POST',
                headers: this.headers,
                credentials: 'include',
                body: JSON.stringify({
                    "context":{
                       "client":{
                          "clientName":"ANDROID",
                          "clientVersion":"14.33.56"
                       }
                    },
                    "browseId":"FEwhat_to_watch",
                    ...(this.homeContinuationToken != '' && {'continuation': this.homeContinuationToken}),
                }),
            });
            const data = await this.status(response);
            var json = await data.text();
            json = JSON.parse(json);
            if (json != null) {

                sectionListRenderer = {}
                if(this.homeContinuationToken == ''){
                    sectionListRenderer = _.first(json.contents.singleColumnBrowseResultsRenderer.tabs).tabRenderer.content.sectionListRenderer;
                    this.headers.set('X-Goog-Visitor-Id', json.responseContext.visitorData ? json.responseContext.visitorData : '')
                }else{
                    sectionListRenderer = json.continuationContents.sectionListContinuation;
                }
                if (sectionListRenderer.continuations[1] && sectionListRenderer.continuations[1].reloadContinuationData) {
                    this.homeReloadToken = sectionListRenderer.continuations[1].reloadContinuationData.continuation;
                }
                if(sectionListRenderer.continuations && sectionListRenderer.continuations[0].nextContinuationData)
                {
                    this.homeContinuationToken = sectionListRenderer.continuations[0].nextContinuationData.continuation;
                    const videos = this.parseHomeVideos(sectionListRenderer.contents);
                    return Promise.resolve(videos)
                }else
                    return Promise.resolve([])
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async getSuggestions(query){
        try {
            const url = `https://suggestqueries.google.com/complete/search?ds=yt&hjson=t&oe=UTF-8&xssi=t&client=youtube-android&pvideo_sec=0&cp=2&ytbolding=0&q=${query}`;
            const response = await fetch(url, {
                headers: this.headers,
                credentials: 'include',
            });
            const data = await this.status(response);
            var json = await data.text();
            json = JSON.parse(json.replace(/^[^[]*/gi, ''));
            queries = json[1].map(q => {
                return q[0]
            })
            return Promise.resolve(queries)
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getChannelInfoWithInnerTube(channelId){
        try {
            const response = await fetch(`${BASE_URL}/search?key=${API_KEY}`, {
                method: 'POST',
                headers: this.headers,
                credentials: 'include',
                body: JSON.stringify({
                    "context":{
                       "client":{
                          "clientName":"ANDROID",
                          "clientVersion":"14.33.56"
                       }
                    },
                    "query":channelId,
                }),
            });
            const data = await this.status(response);
            var json = await data.json();
            if (json != null) {
                contents = json.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
                channel = _.filter(contents, 'compactChannelRenderer')[0]
                if(!_.isEmpty(channel))
                {
                    channel = channel.compactChannelRenderer;
                    return Promise.resolve({
                        title: channel.title.runs[0].text,
                        videoCount: channel.videoCountText.runs[0].text,
                        subscriberCount: channel.subscriberCountText.runs[0].text,
                        thumbnail: _.last(channel.thumbnail.thumbnails).url
                    })
                }else
                    return Promise.resolve([])
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async getChannelInfo(channelId){
        try {
            ''
            const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,id&id=${channelId}&key=${API_KEY}`, {
                method: 'GET',
                headers: this.headers,
                credentials: 'include',
            });
            const data = await this.status(response);
            var json = await data.json();
            if (json != null) {
                snippet = json.items[0].snippet;
                statistics = json.items[0].statistics;
                if(!_.isEmpty(snippet))
                {
                    return Promise.resolve({
                        title: snippet.title,
                        videoCount: millify.default(statistics.videoCount),
                        subscriberCount: statistics.hiddenSubscriberCount ? -1 : millify.default(statistics.subscriberCount),
                        thumbnail: snippet.thumbnails.medium ? snippet.thumbnails.medium.url : snippet.thumbnails.default.url
                    })
                }else
                    return Promise.resolve([])
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async search(query, pagination){
        try {
            if(!pagination)
                this.searchContinuationToken = ''
            const response = await fetch(`${BASE_URL}/search?key=${API_KEY}`, {
                method: 'POST',
                headers: this.headers,
                credentials: 'include',
                body: JSON.stringify({
                    "context":{
                       "client":{
                          "clientName":"ANDROID",
                          "clientVersion":"14.33.56"
                       }
                    },
                    "query":query,
                    ...(this.searchContinuationToken != '' && {'continuation': this.searchContinuationToken}),
                }),
            });
            const data = await this.status(response);
            var json = await data.json();
            if (json != null) {
                contents = {};
                continuations = {};
                if(this.searchContinuationToken == ''){
                    
                    sectionListRenderer = {}
                    if (json.contents.sectionListRenderer.contents.length > 1) {
                        sectionListRenderer = _.pullAt(json.contents.sectionListRenderer.contents, [0, 2]);
                        continuations = sectionListRenderer[1].itemSectionRenderer.continuations;
                        contents = _.concat(sectionListRenderer[0].itemSectionRenderer.contents, sectionListRenderer[1].itemSectionRenderer.contents);
                    }else{
                        sectionListRenderer = json.contents.sectionListRenderer.contents;
                        continuations = sectionListRenderer[0].itemSectionRenderer.continuations;
                        contents = sectionListRenderer[0].itemSectionRenderer.contents;
                    }
                    this.headers.set('X-Goog-Visitor-Id', json.responseContext.visitorData ? json.responseContext.visitorData : '')
                }else{
                    const sectionListRenderer = json.continuationContents.itemSectionContinuation
                    continuations = sectionListRenderer.continuations;
                    contents = sectionListRenderer.contents
                }
                if(continuations && continuations[0].nextContinuationData)
                {
                    this.searchContinuationToken = continuations[0].nextContinuationData.continuation;
                    const videos = this.parseSearchVideos(contents);
                    return Promise.resolve(videos)
                }else
                    return Promise.resolve([])
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }

    parseHomeVideos(topics) {
        var array = []
        const parsedVideos = topics.map(topic => {
            let videos = topic.shelfRenderer.content.horizontalListRenderer.items;
            videos = _.filter(videos, 'gridVideoRenderer')
            return videos.map(video => {
                video = video.gridVideoRenderer;
                try { 
                    const shortBylineText = _.first(video.shortBylineText.runs);
                    return {
                        id: video.videoId,
                        title: _.first(video.title.runs).text,
                        thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
                        publishedTime: video.publishedTimeText ? _.first(video.publishedTimeText.runs).text : 'LIVE',
                        owner: {
                            name: shortBylineText.text,
                            id: shortBylineText.navigationEndpoint.browseEndpoint.browseId,
                            username: shortBylineText.navigationEndpoint.browseEndpoint.canonicalBaseUrl,
                            thumbnail: _.last(video.channelThumbnail.thumbnails).url
                        },
                        views: _.first(video.shortViewCountText.runs).text,
                        duration: _.first(video.thumbnailOverlays).thumbnailOverlayTimeStatusRenderer.text.runs[0].text
                    };
                } catch (error) {
                    console.log(error)
                }
            })
        });
        array.push(parsedVideos);
        return _.flatMapDeep(array);
    }

    parseSearchVideos(videos) {
        videos = _.filter(videos, 'compactVideoRenderer')
        const parsedVideos = videos.map(video => {
            video = video.compactVideoRenderer
            try {
                const shortBylineText = _.first(video.shortBylineText.runs);
                return {
                    id: video.videoId,
                    title: _.first(video.title.runs).text,
                    thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
                    publishedTime: video.publishedTimeText ? _.first(video.publishedTimeText.runs).text : 'LIVE',
                    owner: {
                        name: shortBylineText.text,
                        id: shortBylineText.navigationEndpoint.browseEndpoint.browseId,
                        username: shortBylineText.navigationEndpoint.browseEndpoint.canonicalBaseUrl,
                        thumbnail: _.last(video.channelThumbnail.thumbnails).url
                    },
                    views: video.shortViewCountText ? _.first(video.shortViewCountText.runs).text : '',
                    duration: _.first(video.thumbnailOverlays).thumbnailOverlayTimeStatusRenderer.text.runs[0].text
                };
            } catch (error) {
                console.log(error)
            }
        })
        return parsedVideos;
    }
}

export default new youtubeAPI()