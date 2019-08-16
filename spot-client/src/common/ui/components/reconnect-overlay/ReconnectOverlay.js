import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { isCurrentlyReconnecting } from 'common/app-state';
import { LoadingIcon } from './../loading-icon';

/**
 * Displays a fullscreen cover when the remote control service is attempting
 * to re-establish a connection.
 *
 * @extends React.PureComponent
 */
export class ReconnectOverlay extends React.PureComponent {
    static propTypes = {
        isReconnecting: PropTypes.bool
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (!this.props.isReconnecting) {
            return null;
        }

        return (
            <div
                className = 'reconnect-overlay'
                data-qa-id = 'reconnect-overlay'>
                <div className = 'reconnect-message'>
                    <LoadingIcon />
                </div>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code ReconnectOverlay}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        isReconnecting: isCurrentlyReconnecting(state)
    };
}

export default connect(mapStateToProps)(ReconnectOverlay);
