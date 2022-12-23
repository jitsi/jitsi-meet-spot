import nativeController from './native-controller';

/**
 * Collection of static functions to issue native commands.
 */
export default class NativeCommands {
    /**
     * Informs the runtime that adjusting of the volume has been requested.
     *
     * @param {string} direction - The direction of the adjustment ('up', 'down').
     * @returns {void}
     */
    static sendAdjustVolume(direction) {
        nativeController.sendMessage('adjustVolume', {
            direction
        });
    }

    /**
     * Informs the runtime that sync with the backend has
     * to be permormed (again).
     *
     * @param {boolean} failed - True, if sync was performed but failed.
     * @returns {void}
     */
    static sendBackendSyncNeeded(failed) {
        nativeController.sendMessage('backendSyncNeeded', {
            failed
        });
    }

    /**
     * Informs the runtime that the app exited.
     *
     * @returns {void}
     */
    static sendExitApp() {
        nativeController.sendMessage('exitApp');
    }

    /** .
     * Informs the runtime that the meeting status has changed.
     *
     * 0: Idle (not in meeting)
     * 1: In meeting
     * (More statuses to come, e.g. Content sharing).
     *
     * @param {number} status - The new meeting status.
     * @returns {void}
     */
    static sendMeetingStatus(status) {
        nativeController.sendMessage('meetingStatus', {
            status
        });
    }

    /**
     * Informs the runtime that the state of update-ability has changed.
     *
     * @param {boolean} okToUpdate - True if ok to update, false otherwise.
     * @returns {void}
     */
    static sendOkToUpdate(okToUpdate) {
        nativeController.sendMessage('spot-electron/auto-updater', {
            updateAllowed: okToUpdate
        });
    }

    /**
     * Informs the runtime that the app has been reset.
     *
     * @returns {void}
     */
    static sendResetApp() {
        nativeController.sendMessage('resetApp');
    }

    /**
     * Informs the runtime that the muted state of a media has changed.
     *
     * @param {string} media - The media ('audio', 'video').
     * @param {boolean} mutedState - The new muted state.
     * @returns {void}
     */
    static sendUpdateMutedState(media, mutedState) {
        nativeController.sendMessage(`${media}MutedState`, mutedState);
    }

    /**
     * Informs the runtime about a new long lived pairing code being available.
     *
     * @param {string} longLivedPairingCode - The new long lived pairing code.
     * @returns {void}
     */
    static sendUpdateLongLivedPairingCode(longLivedPairingCode) {
        nativeController.sendMessage('updateLongLivedPairingCode', {
            longLivedPairingCode
        });
    }

    /**
     * Informs the runtime about a new remote join code being available.
     *
     * @param {string} remoteJoinCode - The new remote join code.
     * @returns {void}
     */
    static sendUpdateRemoteJoinCode(remoteJoinCode) {
        nativeController.sendMessage('updateJoinCode', {
            remoteJoinCode
        });
    }
}
