import { combineReducers, createStore } from 'redux';

import * as actions from './actions';
import pairedRemotesReducer from './reducer';
import * as selectors from './selectors';

describe('paired remotes state', () => {
    let dispatch, getState;

    beforeEach(() => {
        ({
            dispatch,
            getState
        } = createStore(combineReducers({ pairedRemotes: pairedRemotesReducer })));
        const permanentRemoveType = 'permanent-remote';

        dispatch(actions.addPairedRemote(1, permanentRemoveType));
        dispatch(actions.addPairedRemote(2, permanentRemoveType));
        dispatch(actions.addPairedRemote(3, permanentRemoveType));
    });

    it('saves reference to a new remote', () => {
        expect(selectors.getPermanentRemotesCount(getState())).toEqual(3);
    });

    it('removes references to a saved remote', () => {
        dispatch(actions.removePairedRemote(3));
        expect(selectors.getPermanentRemotesCount(getState())).toEqual(2);

        dispatch(actions.removePairedRemote(2));
        expect(selectors.getPermanentRemotesCount(getState())).toEqual(1);

        dispatch(actions.removePairedRemote(1));
        expect(selectors.getPermanentRemotesCount(getState())).toEqual(0);
    });

    it('removes all references to saved remotes', () => {
        dispatch(actions.clearAllPairedRemotes());

        expect(selectors.getPermanentRemotesCount(getState())).toEqual(0);
    });
});
