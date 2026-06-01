import { getSpotServicesConfig, type RootState } from '../app-state';

/**
 * Returns the permanent pairing code to be used by Spot TV and Spot Remotes which stay connected to the service for
 * long periods of time.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getPermanentPairingCode(state: RootState): string {
    return state.backend.permanentPairingCode as string;
}

/**
 * Checks whether or not the backend is to be used with the remote control service.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isBackendEnabled(state: RootState): boolean {
    return Boolean(getSpotServicesConfig(state).pairingServiceUrl);
}
