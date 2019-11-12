import createStateContext from "react-context-simply";
import * as actions from './actions'
import blockedReducer from './reducers'

const initialState = {
    blockedVideos: [],
    blockedChannels: [],
    blockedTitles: [],
    loading: false,
    error: null
}

const { 
    useStateValue, 
    StateProvider, 
    StateContext 
} = createStateContext(initialState, blockedReducer, actions)

const useBlockedState = useStateValue
const BlockedState = StateProvider

export {
    useBlockedState, 
    BlockedState,
    StateContext
}