// FIXME Reaching directly because of circular dependency
import { getTenant } from 'common/app-state/setup/selectors';

import remoteControlClient from './remoteControlClient';
import remoteControlServer from './remoteControlServer';

/**
 * A class which automatically invokes {@code remoteControlClient} and
 * {@code remoteControlServer} methods to sync with changes to the redux state.
 */
export default class RemoteControlServiceSubscriber {
    /**
     * Initializes a new {@code RemoteControlServiceSubscriber} instance.
     */
    constructor() {
        this._previousRoomName = '';
        this._previousSpotTvState = {};
        this._previousTenant = undefined;
        this._previousCalendarEvents = [];
    }

    /**
     * For Spot-TV, as it updates its local state in redux, send a presence
     * update to all Spot-Remotes. For Spot-Remotes, when Spot-TV joins a
     * meeting, trigger any deferred screenshares.
     *
     * @param {Object} state - The redux state from which to subscribe to
     * app-state updates and notify the remote control services.
     * @returns {oid}
     */
    onUpdate(state) {
        const newSpotTvState = state.spotTv;
        const newCalendarEvents = state.calendars.events || [];
        const newRoomName = state.setup.displayName;
        const newTenant = getTenant(state);

        if (newSpotTvState === this._previousSpotTvState
            && newCalendarEvents === this._previousCalendarEvents
            && newRoomName === this._previousRoomName
            && newTenant === this._previousTenant
        ) {
            return;
        }

        remoteControlServer.updateStatus({
            ...newSpotTvState,
            roomName: newRoomName,
            tenant: getTenant(state),
            calendar: newCalendarEvents
        });

        if (this._previousSpotTvState.inMeeting !== newSpotTvState.inMeeting
            && newSpotTvState.inMeeting) {
            remoteControlClient.startAnyDeferredWirelessScreenshare();
        }

        this._previousRoomName = newRoomName;
        this._previousSpotTvState = newSpotTvState;
        this._previousTenant = newTenant;
        this._previousCalendarEvents = newCalendarEvents;
    }
}
