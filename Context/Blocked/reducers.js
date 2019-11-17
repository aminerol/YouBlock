import * as constants from './constants';

export default function blockedReducer(state, action){
    switch (action.type) {
        case constants.GET_BLOCKED_CONTENT_SUCESS:
            return {
                ...state,
                blockedVideos: action.blockedVideos,
                blockedChannels: action.blockedChannels,
                blockedTitles: action.blockedTitles ,
                loading: action.loading
            }
        case constants.GET_BLOCKED_CONTENT_FAIL:
            return {
                ...state,
                loading: action.loading,
                error: action.error
            }
        case constants.GET_BLOCKED_CONTENT_LOAD:
            return {
                ...state,
                loading: action.loading
            }
        case constants.BLOCK_VIDEO:
            return {
                ...state,
                blockedVideos: [
                    ...state.blockedVideos,
                    action.video
                ],
            }
        case constants.UNBLOCK_VIDEO:
            const newState = {
                ...state,
                blockedVideos: state.blockedVideos.filter(item => item.id !== action.videoId)
            }
            return newState
        case constants.BLOCK_CHANNEL:
            return {
                ...state,
                blockedChannels: [
                    ...state.blockedChannels,
                    action.channel
                ],
            }
        case constants.UNBLOCK_CHANNEL:
            return {
                ...state,
                blockedChannels: state.blockedChannels.filter(item => item.id !== action.channel.id)
            }
        case constants.UPDATE_CHANNEL:
            return {
                ...state,
                blockedChannels: state.blockedChannels.map(item => item.id === action.oldChannel.id ? action.newChannel : item)
            }
        case constants.BLOCK_TITLE:
            return {
                ...state,
                blockedTitles: [
                    ...state.blockedTitles,
                    action.title
                ],
            }
        case constants.UNBLOCK_TITLE:
            return {
                ...state,
                blockedTitles: state.blockedTitles.filter(item => item !== action.title)
            }
        default:
            return state
    }
}