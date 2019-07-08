import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { isSpot } from 'common/app-state';
import { ROUTES } from 'common/routing';

import { Countdown, StatusOverlay } from './../components';

import View from './view';

/**
 * A component for showing a potentially fatal error has occurred and providing
 * the ability to reload the app or reset app state.
 *
 * @returns {ReactElement}
 */
export class FatalError extends React.Component {
    static propTypes = {
        isSpotTV: PropTypes.bool
    };

    /**
     * Initializes a new {@code FatalError} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onReload = this._onReload.bind(this);
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
                <StatusOverlay title = 'An unexpected error occurred'>
                    <div>We will redirect you to home in</div>
                    <Countdown
                        onCountdownComplete = { this._onReload }
                        startTime = { 10 } />
                </StatusOverlay>
            </View>
        );
    }

    /**
     * Forces a reload of the window by redirecting to the root path.
     *
     * @private
     * @returns {void}
     */
    _onReload() {
        window.location = this.props.isSpotTV ? ROUTES.HOME : ROUTES.CODE;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code FatalError}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isSpotTV: isSpot(state)
    };
}

export default connect(mapStateToProps)(FatalError);
