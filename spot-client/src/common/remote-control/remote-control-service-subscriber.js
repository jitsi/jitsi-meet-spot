import remoteControlService from './remote-control-service';

/**
 * A class which automatically invokes {@code remoteControlService} methods as
 * the state of Spot-TV changes.
 */
export default class RemoteControlServiceSubscriber {
    /**
     * Initializes a new {@code RemoteControlServiceSubscriber} instance.
     */
    constructor() {
        this._previousSpotTvState = {};
    }

    /**
     * For Spot-TV, as it updates its local state in redux, send a presence
     * update to all Spot-Remotes. For Spot-Remotes, when Spot-TV joins a
     * meeting, trigger any deferred screenshares.
     *
     * @param {Object} store - The redux store from which to subscribe to
     * app-state updates and notify the remoteControlService.
     * @returns {oid}
     */
    onUpdate(store) {
        const newSpotTvState = store.getState().spotTv;

        if (newSpotTvState === this._previousSpotTvState) {
            return;
        }

        remoteControlService.updateStatus(newSpotTvState);

        if (this._previousSpotTvState.inMeeting !== newSpotTvState.inMeeting
            && newSpotTvState.inMeeting) {
            remoteControlService.startAnyDeferredWirelessScreenshare();
        }

        this._previousSpotTvState = newSpotTvState;
    }
}
