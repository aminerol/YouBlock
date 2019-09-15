var _ = require('lodash');
const BASE_URL = 'https://m.youtube.com';

class youtubeAPI {
    constructor() {
        this.continuationToken = '';
        this.trackingParams = '';
        this.headers = new Headers({
            'User-Agent': 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36',
            'Accept': '*/*',
            'X-YouTube-Client-Name': '2',
            'X-YouTube-Client-Version': '2.20190830.06.01'
        });
    }

    status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.status))
        }
    }

    async getHomeVideos(){
        try {
            const response = await fetch(`${BASE_URL}/?ctoken=${this.continuationToken}&pbj=1&itct=${this.trackingParams}`, {
                headers: this.headers,
                credentials: 'include'
            });
            const data = await this.status(response);
            var json = await data.text();
            json = JSON.parse(json);
            if (json != null) {
                if(this.continuationToken == ''){
                    const sectionListRenderer = _.first(json.response.contents.singleColumnBrowseResultsRenderer.tabs).tabRenderer.content.sectionListRenderer;
                    this.continuationToken = sectionListRenderer.continuations[1].nextContinuationData.continuation;
                    this.trackingParams = sectionListRenderer.continuations[1].nextContinuationData.clickTrackingParams;
                    const videos = this.parseVideos(sectionListRenderer.contents);
                    return Promise.resolve(videos)
                }else{
                    const sectionListContinuation = json.response.continuationContents.sectionListContinuation;
                    this.continuationToken = sectionListContinuation.continuations[0].nextContinuationData.continuation;
                    this.trackingParams = sectionListContinuation.continuations[0].nextContinuationData.clickTrackingParams;
                    const videos = this.parseVideos(sectionListContinuation.contents);
                    return Promise.resolve(videos);
                }
                
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }

    parseVideos(videos) {
        return videos.map(item => {
            const video = item.itemSectionRenderer.contents[0].videoWithContextRenderer;
            const shortBylineText = _.first(video.shortBylineText.runs);
            return {
                id: video.videoId,
                title: _.first(video.headline.runs).text,
                thumbnail: _.last(video.thumbnail.thumbnails).url,
                publishedTime: _.first(video.publishedTimeText.runs).text,
                owner: {
                    name: shortBylineText.text,
                    id: shortBylineText.navigationEndpoint.browseEndpoint.browseId,
                    username: shortBylineText.navigationEndpoint.browseEndpoint.canonicalBaseUrl,
                    thumbnail: _.last(video.channelThumbnail.channelThumbnailWithLinkRenderer.thumbnail.thumbnails).url
                },
                views: _.first(video.shortViewCountText.runs).text,
                duration: _.first(video.thumbnailOverlays).thumbnailOverlayTimeStatusRenderer.text.runs[0].text
            };
        });
    }
}

export default new youtubeAPI()