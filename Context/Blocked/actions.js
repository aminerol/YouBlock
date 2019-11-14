import * as constants from './constants';
import LocalStorage from '../../services/localStorage';

export const getBlockedContent = () => async (state, dispatch) => {

    dispatch({type: constants.GET_BLOCKED_CONTENT})
    try {
        dispatch(getBlockedContentLoading())
        LocalStorage.get([constants.BLOCKED_VIDEOS_STORAGE_KEY, constants.BLOCKED_CHANNELS_STORAGE_KEY, constants.BLOCKED_TITLES_STORAGE_KEY]).then(result => {
            dispatch(getBlockedContentSucces(result[0] || [], result[1] || [], result[2] || []))
        })
    }catch(error){
        dispatch(getBlockedContentFail(error))
    }
}

export const getBlockedContentSucces = (videos, channels, titles) => {
    return { type: constants.GET_BLOCKED_CONTENT_SUCESS, blockedVideos: videos, blockedChannels: channels, blockedTitles: titles, loading: false }
}
export const getBlockedContentLoading = () => {
    return { type: constants.GET_BLOCKED_CONTENT_LOAD, loading: true }
}
export const getBlockedContentFail = (error) => {
    return { type: constants.GET_BLOCKED_CONTENT_FAIL, loading: false, error: error }
}

export const blockVideo = (video) => async (state, dispatch) => {
    LocalStorage.push(  
        constants.BLOCKED_VIDEOS_STORAGE_KEY, 
        video, 
        {isExist: true, predicate: item => item.id === video.id }
    ).then(pushed => {
        pushed && dispatch({ type: constants.BLOCK_VIDEO, video: video })
    })
}
export const unBlockVideo = (video) => async (state, dispatch) => {
    LocalStorage.pop(constants.BLOCKED_VIDEOS_STORAGE_KEY, video.id, {path: 'id'}).then(()=>{
        dispatch({
            type: constants.UNBLOCK_VIDEO,
            videoId: video.id
        })
    })
}

export const blockChannel = (channel) => async (state, dispatch) => {
    LocalStorage.push(  
        constants.BLOCKED_CHANNELS_STORAGE_KEY, 
        channel, 
        {isExist: true, predicate: item => item.id === channel.id }
    ).then((pushed) => {
        pushed && dispatch({ type: constants.BLOCK_CHANNEL, channel: channel })
    })
}
export const unBlockChannel = (channel) => async (state, dispatch) => {
    LocalStorage.pop(constants.BLOCKED_CHANNELS_STORAGE_KEY, channel.id, {path: 'id'}).then(()=>{
        dispatch({
            type: constants.UNBLOCK_CHANNEL,
            channel: channel
        })
    })
}

// export const blockTitle = (title) => ({
//     type: constants.BLOCK_TITLE,
//     payload: title
// })
// export const unBlockTitle = (title) => ({
//     type: constants.UNBLOCK_TITLE,
//     payload: title
// })

