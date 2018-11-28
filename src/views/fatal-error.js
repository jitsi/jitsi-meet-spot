import PropTypes from 'prop-types';
import React from 'react';

import { ResetState } from 'features/admin';
import { Button } from 'features/button';

import View from './view';
import styles from './view.css';

/**
 * A component for showing a potentially fatal error has occurred and providing
 * the ability to reload the app or reset app state.
 *
 * @returns {ReactElement}
 */
export default function FatalError() {
    return (
        <View
            hideBackground = { true }
            name = 'error'>
            <div className = { styles.container }>
                <div className = { styles.admin }>
                    <div>Whoops, something went wrong.</div>
                    <Button onClick = { reloadToHome }>
                        Reload
                    </Button>
                    <ResetState />
                </div>
            </div>
        </View>
    );
}

FatalError.propTypes = {
    error: PropTypes.string,
    info: PropTypes.string
};

/**
 * Forces a reload of the window by redirecting to the root path.
 *
 * @private
 * @returns {void}
 */
function reloadToHome() {
    window.location.href = '/';
}
