const { app } = require('electron');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const { logger } = require('../logger');
const defaultConfig = require('../../config');

const PERSISTED_CONFIG = path.join(app.getPath('userData'), 'config.json');

/**
 * A singleton config repository.
 */
class Config {
    _config;

    /**
     * Instantiates the config repo.
     *
     * @param {?Object} defaults - The default config to be applied.
     */
    constructor(defaults) {
        this._config = _.defaultsDeep(this._config, this._loadPersistedConfig(), defaults);
        this._throttledPersist = _.throttle(() => {
            this._persistConfig();
        }, 2000);
    }

    /**
     * Retreives a config value based on its path.
     *
     * @param {string} keyPath - The config path to retreive.
     * @returns {Object|number|string|undefined}
     */
    getValue(keyPath) {
        return _.get(this._config, keyPath);
    }

    /**
     * Updates a value in the config based on its path.
     *
     * @param {string} keyPath - The config path to update.
     * @param {Object|number|string|undefined} value - The valu eot update to.
     * @returns {void}
     */
    setValue(keyPath, value) {
        _.set(this._config, keyPath, value);
        this._throttledPersist();
    }

    /**
     * Loads the persisted config, if any, and returns it.
     *
     * @returns {?Object}
     */
    _loadPersistedConfig() {
        try {
            if (fs.existsSync(PERSISTED_CONFIG)) {
                const content = fs.readFileSync(PERSISTED_CONFIG, {
                    encoding: 'utf8'
                });

                return JSON.parse(content);
            }

            logger.info('No persisted config to load.');

        } catch (error) {
            logger.error('Error reading persisted config.', { error });
        }

        return undefined;
    }

    /**
     * Persists the config to the file system.
     *
     * @returns {void}
     */
    _persistConfig() {
        fs.writeFile(PERSISTED_CONFIG, JSON.stringify(this._config, 4), error => {
            if (error) {
                logger.error('Error persisting config.', { error });
            } else {
                logger.info('Config persisted.');
            }
        });
    }

}

module.exports = {
    config: new Config(defaultConfig)
};
