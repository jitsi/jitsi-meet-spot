import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getJoinCode } from 'common/app-state';
import { windowHandler } from 'common/utils';

/**
 * Displays information necessary to input a join code to become a remote
 * control for a Spot.
 *
 * @extends React.Component
 */
class JoinInfo extends React.Component {
    static propTypes = {
        joinCode: PropTypes.string
    };

    /**
     * Initializes a new {@code JoinInfo} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onOpenSpotRemote = this._onOpenSpotRemote.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { joinCode } = this.props;

        if (!joinCode) {
            return null;
        }

        const spotRemoteUrl = `${this._getSpotRemoteConnectUrl()}`;

        return (
            <div
                className = 'join-info'
                onClick = { this._onOpenSpotRemote }>
                <span
                    className = 'info-code'
                    data-qa-id = 'info-code'>
                    { spotRemoteUrl }
                </span>
            </div>
        );
    }

    /**
     * Generates the URL for a browser to become a Spot-Remote.
     *
     * @private
     * @returns {string}
     */
    _getSpotRemoteConnectUrl() {
        return `${windowHandler.getBaseUrl()}/${this.props.joinCode.toUpperCase()}`;
    }

    /**
     * Debug feature for opening the Spot-Remote to the Spot-TV.
     *
     * @private
     * @returns {void}
     */
    _onOpenSpotRemote() {
        windowHandler.openNewWindow(this._getSpotRemoteConnectUrl());
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code JoinInfo}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        joinCode: getJoinCode(state)
    };
}

export default connect(mapStateToProps)(JoinInfo);
