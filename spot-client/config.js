/**
 * Overrides for the default configuration for Spot. See file default-config.js
 * for all the default values which are used.
 */
window.JitsiMeetSpotConfig = {
    // Example override:
    // MEETING_DOMAINS_WHITELIST: [ 'meet.jit.si' ],
    // XMPP_CONFIG: {
    //     hosts: {
    //         muc: 'conference.meet.jit.si'
    //     }
    // }

    // Example override for spot-admin (backend mode):
    // SPOT_SERVICES: {
    //     pairingServiceUrl: 'http://localhost:8001/pair',
    //     roomKeeperServiceUrl: 'http://localhost:8001/room/info'
    // },
    // CALENDARS: { BACKEND: { SERVICE_URL: 'http://localhost:8001/calendar?tzid={tzid}' } }
    //
    // Equivalently, these can be supplied at build time via the PAIRING_SERVICE_URL /
    // ROOM_KEEPER_SERVICE_URL / CALENDAR_SERVICE_URL env vars (baked in by default-config.ts) —
    // this is how the spot-webdriver `ci:backend` E2E run enables backend mode.
};
