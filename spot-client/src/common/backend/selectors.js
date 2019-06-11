import { getSpotServicesConfig } from '../app-state';

/**
 * Checks whether or not the backend is to be used with the remote control service.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isBackendEnabled(state) {
    return Boolean(getSpotServicesConfig(state).pairingServiceUrl);
}
