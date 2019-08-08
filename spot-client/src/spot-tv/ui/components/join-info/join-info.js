import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getRemoteJoinCode, getShareDomain } from 'common/app-state';
import { windowHandler } from 'common/utils';
import { RemoteJoinCode } from 'common/ui';

/**
 * Displays information about how a Spot-Remote can pair with a Spot-TV.
 *
 * @extends React.Component
 */
class JoinInfo extends React.Component {
    static propTypes = {
        remoteJoinCode: PropTypes.string,
        shareDomain: PropTypes.string,
        showDomain: PropTypes.bool
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
        const { remoteJoinCode } = this.props;

        if (!remoteJoinCode) {
            return null;
        }

        return (
            <div
                className = 'join-info'
                onClick = { this._onOpenSpotRemote }>
                <span className = 'info-code-container'>
                    { this._getCopyToDisplay() }
                </span>
            </div>
        );
    }

    /**
     * Returns the string to display for connecting as a Spot-Remote.
     *
     * @private
     * @returns {string}
     */
    _getCopyToDisplay() {
        const { shareDomain, showDomain } = this.props;

        const codeElement = <RemoteJoinCode data-qa-id = 'info-code' />;

        if (!showDomain) {
            return codeElement;
        }

        return (
            <>
                { `${shareDomain || windowHandler.getHost()}/` }
                { codeElement }
            </>
        );
    }

    /**
     * Generates the URL for a browser to become a Spot-Remote.
     *
     * @private
     * @returns {string}
     */
    _getSpotRemoteConnectUrl() {
        return `${windowHandler.getBaseUrl()}/${this.props.remoteJoinCode.toUpperCase()}`;
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
        remoteJoinCode: getRemoteJoinCode(state),
        shareDomain: getShareDomain(state)
    };
}

export default connect(mapStateToProps)(JoinInfo);
