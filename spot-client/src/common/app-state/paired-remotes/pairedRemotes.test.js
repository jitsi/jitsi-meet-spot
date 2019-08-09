import { combineReducers, createStore } from 'redux';

import { CLIENT_TYPES } from 'common/remote-control';

import * as actions from './actions';
import pairedRemotesReducer from './reducer';
import * as selectors from './selectors';

describe('paired remotes state', () => {
    let dispatch, getState;

    /**
     * Test helper to check if the redux state contains the expected number
     * of permanent and temporary Spot-Remotes.
     *
     * @param {number} permanentRemotes - The expected number of permanently
     * paired Spot-Remotes.
     * @param {number} temporaryRemotes - The expected number of temporarily
     * paired Spot-Remotes.
     * @private
     * @returns {void}
     */
    function validateRemoteCounts(permanentRemotes, temporaryRemotes) {
        const state = getState();

        expect(selectors.getPermanentPairedRemotesCount(state))
            .toEqual(permanentRemotes);
        expect(selectors.getPairedRemotesCount(state))
            .toEqual(permanentRemotes + temporaryRemotes);
    }

    beforeEach(() => {
        ({
            dispatch,
            getState
        } = createStore(combineReducers({ pairedRemotes: pairedRemotesReducer })));

        dispatch(actions.addPairedRemote(1, CLIENT_TYPES.SPOT_REMOTE_PERMANENT));
        dispatch(actions.addPairedRemote(2, CLIENT_TYPES.SPOT_REMOTE_PERMANENT));
        dispatch(actions.addPairedRemote(3, CLIENT_TYPES.SPOT_REMOTE_TEMPORARY));
    });

    it('saves reference to a new remote', () => {
        validateRemoteCounts(2, 1);
    });

    it('removes references to a saved remote', () => {
        validateRemoteCounts(2, 1);

        dispatch(actions.removePairedRemote(3));

        validateRemoteCounts(2, 0);

        dispatch(actions.removePairedRemote(2));

        validateRemoteCounts(1, 0);

        dispatch(actions.removePairedRemote(1));

        validateRemoteCounts(0, 0);
    });

    it('removes all references to saved remotes', () => {
        dispatch(actions.clearAllPairedRemotes());

        validateRemoteCounts(0, 0);
    });
});
