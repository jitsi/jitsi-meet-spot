import { BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';

import { clientController } from '../client-control/index.js';
import { defaultSpotURL } from '../default-config.js';
import { fileLogger, logger } from '../logger/index.js';
import { OnlineDetector } from '../online-detector/index.js';

/**
 * This is the reference for the main window. May be exposed from this scope later, but we don't have
 * any reasons to do it yet.
 */
let applicationWindow: BrowserWindow;

/**
 * Function to create the main window (application window).
 *
 * @returns {void}
 */
export function createApplicationWindow(): void {
    const onlineDetector = new OnlineDetector();

    let showCrashPageTimeout: ReturnType<typeof setTimeout> | undefined;

    clientController.addListener('meetingStatus', ({ status }: { status: number; }) => {
        logger.info(`Current meeting status: ${status}`);

        // Pause the online detector while in a meeting so it doesn't disrupt them.
        // Re-arm it when the meeting ends.
        if (status === 0) {
            onlineDetector.start();
        } else {
            onlineDetector.pause();
        }
    });

    applicationWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });

    // Set event handlers.
    onlineDetector.addListener(OnlineDetector.ONLINE_STATUS_CHANGED, (isOnline: boolean) => {
        clearTimeout(showCrashPageTimeout);

        logger.warn(`Online status changed: ${isOnline}`);

        if (isOnline) {
            applicationWindow.loadURL(defaultSpotURL);
        } else {
            applicationWindow.loadFile('src/static/offline.html');
        }
    });

    const loadCrashedPage = () => {
        // The setTimeout 0 is necessary to clear the current stack or else
        // navigation will cause the main app to crash as well.
        setTimeout(() => {
            applicationWindow.loadFile('src/static/crashed.html')
                .then(() => {
                    showCrashPageTimeout = setTimeout(
                        () => applicationWindow.loadURL(defaultSpotURL),
                        5000
                    );
                });
        });
    };

    applicationWindow.webContents.on('render-process-gone', () => {
        if (!onlineDetector.getLastOnlineStatus()) {
            return;
        }

        loadCrashedPage();
    });

    applicationWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
        logger.error('Failed to load', {
            errorCode,
            errorDescription
        });

        if (!onlineDetector.getLastOnlineStatus()) {
            return;
        }

        loadCrashedPage();
    });

    applicationWindow.on('closed', () => {
        onlineDetector.destroy();
    });

    applicationWindow.loadURL(defaultSpotURL);
    logger.info(`Spot started with Spot-TV URL ${defaultSpotURL}`);

    applicationWindow.webContents.on('console-message', event => {
        fileLogger.logToFile(event.level, `console: ${event.message}`);
    });

    onlineDetector.start();

    // Kiosk mode. On by default in production mode. It can either be forced or
    // disabled, both in development and production modes.
    //
    // NOTE: While kiosk mode can be set as part of the BrowserWindow options, it was moved
    //       here due to some obscure issues with Big Sur: the iframe API events were not
    //       received when in kiosk mode, only in Big Sur. Weird, I know. -saghul
    const kiosk = (!isDev && process.argv.indexOf('--no-kiosk') === -1) || process.argv.indexOf('--force-kiosk') !== -1;

    applicationWindow.setKiosk(kiosk);
}
