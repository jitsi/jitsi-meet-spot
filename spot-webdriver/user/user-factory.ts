import * as constants from '../constants/index.js';

import SpotRemote from './spot-remote-user.js';
import SpotTV from './spot-tv-user.js';

/**
 * The current webdriver.io configuration creates two browser drivers. Both
 * are wrapped in a user model and factory getter to abstract that detail from
 * the tests.
 */
let spotRemote: SpotRemote | undefined;
let spotTV: SpotTV | undefined;

export default {
    /**
     * Returns an instance of {@code SpotTV} which is the main Spot screen.
     *
     * @returns {SpotTV}
     */
    getSpotTV(): SpotTV {
        if (!spotTV) {
            spotTV = new SpotTV(constants.SPOT_BROWSER);
        }

        return spotTV;
    },

    /**
     * Returns an instance of {@code SpotRemote} which acts as the remote controller of
     * {@code SpotTV}.
     *
     * @returns {SpotRemote}
     */
    getSpotRemote(): SpotRemote {
        if (!spotRemote) {
            spotRemote = new SpotRemote(constants.REMOTE_CONTROL_BROWSER);
        }

        return spotRemote;
    }
};
