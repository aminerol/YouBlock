import createStateContext from "react-context-simply";
import * as actions from './actions'
import blockedReducer from './reducers'

const initialState = {
    blockedVideos: [],
    blockedChannels: [],
    blockedTitles: [],
    loading: true,
    error: null
}

const { 
    useStateValue, 
    StateProvider, 
    StateContext 
} = createStateContext(initialState, blockedReducer, actions)

const useBlockedState = useStateValue
const BlockedState = StateProvider
const BlockedStateContext = StateContext

export {
    useBlockedState, 
    BlockedState,
    BlockedStateContext
}