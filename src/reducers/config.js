export const CONFIG_UPDATED = 'CONFIG_UPDATED';

/**
 * A {@code Reducer} to update the current Redux state for the 'config'
 * feature. The 'config' feature stores current application wide feature
 * settings.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @param {Object} action - The Redux state update payload.
 */
const config = (state = {}, action) => {
    switch (action.type) {
    case CONFIG_UPDATED:
        return {
            ...state,
            ...action.newConfig
        };
    }

    return state;
};

export default config;
