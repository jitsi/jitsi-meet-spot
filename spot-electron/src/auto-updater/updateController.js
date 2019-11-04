const { app } = require('electron');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');

const { clientController } = require('../client-control');
const { logger } = require('../logger');

// Forward all levels expected by the 'electron-updater' to the spot logger
autoUpdater.logger = {
    info(msg) {
        logger.info(msg);
    },
    warn(msg) {
        logger.warn(msg);
    },
    error(msg) {
        logger.error(msg);
    },
    debug(msg) {
        logger.debug(msg);
    }
};

autoUpdater.on('update-available', updateInfo => {
    logger.info('update-available', { updateInfo });
});

autoUpdater.on('update-not-available', updateInfo => {
    logger.info('update-not-available', { updateInfo });
});

autoUpdater.on('error', error => {
    logger.error('electron-updater error', { error });
});

autoUpdater.on('download-progress', progress => {
    logger.info('download-progress', { progress });
});


/**
 * Class controls spot-electron updates by listening for it's okay to update message from the spot-client.
 */
class UpdateController {
    /**
     * Initializes.
     *
     * @param {ClientController} spotClientController - The client controller used to listen for commands sent by
     * the spot-client.
     */
    constructor(spotClientController) {
        this._updateDownloaded = false;
        this._updateAllowed = undefined;

        autoUpdater.on('update-downloaded', this._onUpdateDownloaded.bind(this));

        app.on('ready', () => this.checkForUpdateAndStartDownload());

        spotClientController.on('spot-electron/auto-updater', ({ updateAllowed }) => {
            logger.debug('received spot-electron/auto-updater', { updateAllowed });

            this._updateAllowed = updateAllowed;

            if (updateAllowed) {
                if (this._updateDownloaded) {
                    this._updateAndRestart();
                } else {
                    // If update is available it will be downloaded and the update will be triggered
                    // from onUpdateDownloaded
                    this.checkForUpdateAndStartDownload();
                }
            }
        });
    }

    /**
     * Checks for update and downloads it if available.
     *
     * @returns {void}
     */
    checkForUpdateAndStartDownload() {
        if (isDev) {
            logger.info('Not checking for spot-electron updates while in the dev mode.');

            return;
        }

        // Calling checkForUpdates also starts the download automatically and when download is completed it will trigger
        // the _onUpdateDownloaded callback.
        autoUpdater.checkForUpdates().then(({ updateInfo }) => {
            logger.info('Check for update results', { updateInfo });
        }, error => {
            logger.error('checkForUpdates failed', { error });
        });
    }

    /**
     * Handles the 'update-downloaded' callback of the 'electron-updater'.
     *
     * @param {Object} updateInfo - Any info about the update as specified by the electron-updater API.
     * @private
     * @returns {void}
     */
    _onUpdateDownloaded(updateInfo) {
        logger.info('update-downloaded', {
            updateAllowed: this._updateAllowed,
            updateInfo
        });
        this._updateDownloaded = true;
        if (typeof this._updateAllowed === 'undefined' || this._updateAllowed) {
            this._updateAndRestart();
        }
    }

    /**
     * Triggers the quit and install 'electron-updater' action.
     *
     * @private
     * @returns {void}
     */
    _updateAndRestart() {
        const isSilent = true;
        const forceRunAfterInstall = true;

        logger.debug('Calling "quitAndInstall"...', {
            isSilent,
            forceRunAfterInstall
        });
        autoUpdater.quitAndInstall(isSilent, forceRunAfterInstall);
    }
}

module.exports = new UpdateController(clientController);
