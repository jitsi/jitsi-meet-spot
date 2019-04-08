/* global process */

/**
 * A version of the configuration with default values set. The dotenv plugin
 * is used here so that during development values can be overridden easily
 * using a .env file.
 */
export default {
    ADVERTISEMENT: {
        APP_NAME: process.env.APP_NAME || ''
    },

    CALENDARS: {
        GOOGLE: {
            CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ''
        },
        OUTLOOK: {
            CLIENT_ID: process.env.OUTLOOK_CLIENT_ID || ''
        }
    },

    DEFAULT_AVATAR_URL: process.env.DEFAULT_AVATAR_URL
        || 'https://meet.jit.si/images/avatar.png',

    DEFAULT_BACKGROUND_IMAGE_URL: process.env.DEFAULT_BACKGROUND_IMAGE_URL
        || '',

    DEFAULT_MEETING_DOMAIN: process.env.DEFAULT_MEETING_DOMAIN || 'meet.jit.si',

    LOGGING: {
        ENDPOINT: process.env.LOGGING_ENDPOINT || ''
    },

    MEDIA: {
        SS_MAX_FPS: process.env.SS_MAX_FPS || 60,
        SS_MIN_FPS: process.env.SS_MIN_FPS || 5
    },

    MODE_DOMAINS: {
        SHARE: undefined
    },

    SPOT_SERVICES: {
        adminServiceUrl: process.env.ADMIN_SERVICE_URL,
        joinCodeServiceUrl: process.env.JOIN_CODE_SERVICE_URL
    },

    ULTRASOUND: {
        EMSCRIPTEN_PATH: process.env.ULTRASOUND_EMSCRIPTEN_PATH || '/dist/',
        MEM_INITIALIZER_PATH:
            process.env.ULTRASOUND_MEM_INITIALIZER_PATH || '/dist/',
        SUPPORTED_ENV_REGEX: process.env.ULTRASOUND_SUPPORT_ENV || 'ipad',
        TRANSMISSION_DELAY: undefined
    },

    XMPP_CONFIG: {
        bosh: process.env.XMPP_BOSH || 'https://meet.jit.si/http-bind',
        hosts: {
            domain: process.env.XMPP_HOSTS_DOMAIN || 'meet.jit.si',
            muc: process.env.XMPP_HOSTS_MUC_URL
                || 'conference.meet.jit.si'
        }
    }
};
