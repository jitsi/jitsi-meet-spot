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
        this._previousRoomName = '';
        this._previousSpotTvState = {};
        this._previousCalendarEvents = [];
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
        const state = store.getState();
        const newSpotTvState = state.spotTv;
        const newCalendarEvents = state.calendars.events || [];
        const newRoomName = state.setup.displayName;

        if (newSpotTvState === this._previousSpotTvState
            && newCalendarEvents === this._previousCalendarEvents
            && newRoomName === this._previousRoomName) {
            return;
        }

        remoteControlService.updateStatus({
            ...newSpotTvState,
            roomName: newRoomName,
            calendar: newCalendarEvents
        });

        if (this._previousSpotTvState.inMeeting !== newSpotTvState.inMeeting
            && newSpotTvState.inMeeting) {
            remoteControlService.startAnyDeferredWirelessScreenshare();
        }

        this._previousRoomName = newRoomName;
        this._previousSpotTvState = newSpotTvState;
        this._previousCalendarEvents = newCalendarEvents;
    }
}
