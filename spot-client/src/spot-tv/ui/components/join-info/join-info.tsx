import type { RootState } from 'common/app-state';
import { getRemoteJoinCode, getShareDomain } from 'common/app-state';
import { RemoteJoinCode } from 'common/ui';
import { windowHandler } from 'common/utils';
import React from 'react';
import { connect } from 'react-redux';

interface IProps {
    remoteJoinCode?: string;
    shareDomain?: string;
    showDomain?: boolean;
}

/**
 * Displays information about how a Spot-Remote can pair with a Spot-TV.
 */
class JoinInfo extends React.Component<IProps> {
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
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        remoteJoinCode: getRemoteJoinCode(state),
        shareDomain: getShareDomain(state)
    };
}

export default connect(mapStateToProps)(JoinInfo);
