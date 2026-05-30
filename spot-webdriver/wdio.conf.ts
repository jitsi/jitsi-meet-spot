import path from 'node:path';

import * as constants from './constants/index.js';
import { getScreenCount } from './screen-info/index.js';

const DESKTOP_SOURCE_NAME = getScreenCount() > 1 ? 'Screen 1' : 'Entire screen';
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as WebdriverIO.MultiremoteConfig['logLevel'];

// Pin the browser so WebdriverIO downloads a managed Chrome for Testing build
// instead of using whatever Google Chrome happens to be preinstalled on the CI
// runner image.
const BROWSER_VERSION = process.env.BROWSER_VERSION || 'stable';
const PATH_TO_FAKE_VIDEO = path.resolve(import.meta.dirname, 'resources', constants.FAKE_SCREENSHARE_FILE_NAME);
const MAX_INSTANCES = process.env.MAX_INSTANCES ? Number(process.env.MAX_INSTANCES) : 1;

// The E2E job runs on a headless Linux runner. --headless=new gives a reliable
// fake-media pipeline (getUserMedia stalls on the macOS runners), and
// --no-sandbox / --disable-dev-shm-usage are required for Chrome to launch in
// the GitHub Linux runner environment.
const LINUX_CI_ARGS = [
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage'
];

export const config: WebdriverIO.MultiremoteConfig = {
    specs: [ path.resolve(import.meta.dirname, 'specs', '**/*.spec.ts') ],

    exclude: [],

    maxInstances: MAX_INSTANCES,
    capabilities: {
        spotBrowser: {
            capabilities: {
                browserName: 'chrome',
                browserVersion: BROWSER_VERSION,
                'goog:chromeOptions': {
                    args: [
                        'use-fake-device-for-media-stream',
                        'use-fake-ui-for-media-stream',
                        `use-file-for-fake-video-capture=${PATH_TO_FAKE_VIDEO}`,
                        '--ignore-certificate-errors',
                        ...LINUX_CI_ARGS
                    ]
                }
            }
        },
        remoteControlBrowser: {
            capabilities: {
                browserName: 'chrome',
                browserVersion: BROWSER_VERSION,
                'goog:chromeOptions': {
                    args: [
                        `auto-select-desktop-capture-source=${DESKTOP_SOURCE_NAME}`,
                        '--ignore-certificate-errors',
                        ...LINUX_CI_ARGS
                    ]
                }
            }
        }
    },

    logLevel: LOG_LEVEL,

    bail: 0,

    baseUrl: 'http://127.0.0.1:8000',

    waitforTimeout: 10000,

    connectionRetryTimeout: 120000,

    connectionRetryCount: 3,

    framework: 'jasmine',

    reporters: [
        'spec',
        [
            'junit',
            {
                outputDir: './webdriver-results'
            }
        ]
    ],

    jasmineOpts: {
        // When running tests against the backend integration, Spot-TVs might
        // encounter JID conflicts while loading the app, so give ample time to
        // recover from them.
        defaultTimeoutInterval: constants.MAX_PAGE_LOAD_WAIT + 30000
    }
};
