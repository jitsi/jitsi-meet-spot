/**
 * Shared type definitions for the spot-admin mock backend.
 */

/** Timing fields attached to every generated token / pairing code. */
export interface ExpiresInfo {
    /** Epoch millis at which the structure was emitted. */
    emitted: number;

    /** Epoch millis at which the structure expires. */
    expires: number;

    /** Lifetime of the structure, in millis. */
    expiresIn: number;
}

/** A (long- or short-lived) access token, optionally paired with a refresh token. */
export interface TokenStructure extends ExpiresInfo {
    accessToken: string;
    refreshToken?: string;
}

/** A pairing code with expiry metadata. */
export interface PairingCodeStructure extends ExpiresInfo {
    code: string;
}

/** Options accepted by the {@link SpotRoom} constructor. */
export interface SpotRoomOptions {
    countryCode?: string;
    jwt?: string;

    /**
     * A fixed refresh token to seed the room's long-lived access token with,
     * instead of generating a random one. Used by the E2E backend tests so the
     * client can be handed a known refresh token up front (see the
     * `BACKEND_REFRESH_TOKEN` env var in spot-webdriver).
     */
    refreshToken?: string;
    shortLivedJwt?: string;
    name?: string;
    tenant?: string;
}

/** A synthetic calendar event returned by the `/calendar` endpoint. */
export interface CalendarEvent {
    allDay: boolean;
    calendarId: string;
    end: string;
    eventId: string;
    meetingLink: string;
    start: string;
    summary: string;
    updatable: boolean;
}
