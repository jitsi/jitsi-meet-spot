import { app } from 'electron';
import _ from 'lodash';
import fs from 'node:fs';
import path from 'node:path';

import { defaultSpotURL } from '../default-config.js';
import { logger } from '../logger/index.js';

const PERSISTED_CONFIG = path.join(app.getPath('userData'), 'config.json');

type ConfigData = Record<string, unknown>;

/**
 * A singleton config repository.
 */
class Config {
    private _config: ConfigData;
    private _throttledPersist: () => void;

    /**
     * Instantiates the config repo.
     *
     * @param defaults - The default config to be applied.
     */
    constructor(defaults: ConfigData) {
        this._config = _.defaultsDeep({}, this._loadPersistedConfig(), defaults);
        this._throttledPersist = _.throttle(() => {
            this._persistConfig();
        }, 2000);
    }

    /**
     * Retrieves a config value based on its path.
     *
     * @param keyPath - The config path to retrieve.
     * @returns {unknown}
     */
    getValue(keyPath: string): unknown {
        return _.get(this._config, keyPath);
    }

    /**
     * Updates a value in the config based on its path.
     *
     * @param keyPath - The config path to update.
     * @param value - The value to update to.
     * @returns {void}
     */
    setValue(keyPath: string, value: unknown): void {
        _.set(this._config, keyPath, value);
        this._throttledPersist();
    }

    /**
     * Loads the persisted config, if any, and returns it.
     *
     * @returns {ConfigData|undefined}
     */
    private _loadPersistedConfig(): ConfigData | undefined {
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
    private _persistConfig(): void {
        fs.writeFile(PERSISTED_CONFIG, JSON.stringify(this._config, null, 4), error => {
            if (error) {
                logger.error('Error persisting config.', { error });
            } else {
                logger.info('Config persisted.');
            }
        });
    }
}

export const config = new Config({ defaultSpotURL });
