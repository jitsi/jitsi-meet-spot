import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { ResetState } from 'features/admin';
import { Button } from 'features/button';
import { isSpot } from 'reducers';

import View from './view';
import styles from './view.css';

/**
 * A component for showing a potentially fatal error has occurred and providing
 * the ability to reload the app or reset app state.
 *
 * @returns {ReactElement}
 */
export class FatalError extends React.Component {
    static propTypes = {
        error: PropTypes.string,
        info: PropTypes.string,
        isSpot: PropTypes.bool
    };

    /**
     * Initializes a new {@code App} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onReloadToHome = this._onReloadToHome.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <View
                hideBackground = { true }
                name = 'error'>
                <div className = { styles.container }>
                    <div className = { styles.admin }>
                        <div>Whoops, something went wrong.</div>
                        <Button onClick = { this._onReloadToHome }>
                            Reload
                        </Button>
                        <ResetState />
                    </div>
                </div>
            </View>
        );
    }

    /**
     * Forces a reload of the window by redirecting to the root path.
     *
     * @private
     * @returns {void}
     */
    _onReloadToHome() {
        window.location.reload();
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code FatalError}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isSpot: isSpot(state)
    };
}

export default connect(mapStateToProps)(FatalError);
