import * as constants from './constants';

export default function blockedReducer(state, action){
    switch (action.type) {
        case constants.GET_BLOCKED_CONTENT_SUCESS:
            return {
                ...state,
                blockedVideos: [
                    ...state.blockedVideos,
                    ...action.blockedVideos || []
                ],
                blockedChannels: [
                    ...state.blockedChannels,
                    ...action.blockedChannels || []
                ],
                blockedTitles: [
                    ...state.blockedTitles,
                    ...action.blockedTitles || []
                ],
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
                videos: [
                    ...state.videos,
                    action.video
                ],
            }
        // case constants.UNBLOCK_VIDEO:
        //     return action.payload
        // case constants.BLOCK_CHANNEL:
        //     return action.payload
        // case constants.UNBLOCK_CHANNEL:
        //     return action.payload
        // case constants.BLOCK_TITLE:
        //     return action.payload
        // case constants.UNBLOCK_TITLE:
        //     return action.payload
        default:
            return state
    }
}