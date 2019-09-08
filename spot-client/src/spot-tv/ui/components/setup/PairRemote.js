import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { getPermanentPairedRemotesCount } from 'common/app-state';
import { Button } from 'common/ui';

import { getLongLivedPairingCodeInfo } from '../../../backend';

/**
 * Displays a setup step showing a join code for a Spot-Remote to use to connect
 * to a Spot-TV.
 *
 * @extends React.Component
 */
export class PairRemote extends React.Component {
    static propTypes = {
        code: PropTypes.string,
        onSuccess: PropTypes.func,
        permanentRemotesCount: PropTypes.number,
        t: PropTypes.func
    };

    /**
     * Completes this setup step if a permanent remote has been paired.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (this.props.permanentRemotesCount > prevProps.permanentRemotesCount) {
            this.props.onSuccess();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'spot-setup pair-remote'>
                <div className = 'setup-title'>
                    { this.props.t('setup.pair') }
                </div>
                <div className = 'setup-content'>
                    <div className = 'description'>
                        { this.props.t('setup.pairAsk') }
                    </div>
                    <div className = 'join-code'>
                        { this.props.code }
                    </div>
                </div>
                <div className = 'setup-buttons'>
                    <Button
                        appearance = 'subtle'
                        onClick = { this.props.onSuccess }>
                        { this.props.t('buttons.skip') }
                    </Button>
                </div>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code PairRemote}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        code: (getLongLivedPairingCodeInfo(state) || {}).code,
        permanentRemotesCount: getPermanentPairedRemotesCount(state)
    };
}

export default connect(mapStateToProps)(
    withTranslation()(PairRemote)
);
