import type { RootState } from 'common/app-state';

/**
 * Returns the long lived pairing code to be used by Spot TV and Spot Remotes
 * which stay connected to the service for long periods of time.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getLongLivedPairingCodeInfo(state: RootState): any {
    return state['spot-tv/backend'].longLivedPairingCodeInfo;
}
