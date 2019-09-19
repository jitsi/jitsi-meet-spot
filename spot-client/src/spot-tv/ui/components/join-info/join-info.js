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
            <div className = 'join-info'>
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

        const codeElement = <RemoteJoinCode qaId = 'info-code' />;

        if (!showDomain) {
            return codeElement;
        }

        return (
            <>
                { `${shareDomain || windowHandler.getBaseUrl()}/` }
                { codeElement }
            </>
        );
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
