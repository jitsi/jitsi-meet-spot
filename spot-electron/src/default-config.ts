/**
 * Static, build-time defaults for the electron shell (distinct from the
 * persisted runtime {@link Config}).
 */

/**
 * The default URL to connect to.
 */
export const defaultSpotURL = process.env.SPOT_URL || 'https://spot.jitsi.net/tv';
