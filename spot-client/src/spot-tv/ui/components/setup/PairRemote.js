import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { isPermanentRemotePaired } from 'common/app-state';
import { Button } from 'common/ui';

import { getLongLivedPairingCodeInfo } from '../../../backend';

/**
 * Displays a setup step showing a join code for a Spot-Remote to use to connect
 * to a Spot-TV.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function PairRemote(props) {
    const {
        code,
        isPairingComplete,
        onSuccess,
        t
    } = props;

    useEffect(() => {
        if (isPairingComplete) {
            onSuccess();
        }
    });

    return (
        <div className = 'spot-setup pair-remote'>
            <div className = 'setup-title'>
                { t('setup.pair') }
            </div>
            <div className = 'setup-content'>
                <div className = 'description'>
                    { t('setup.pairAsk') }
                </div>
                <div className = 'join-code'>
                    { code }
                </div>
            </div>
            <div className = 'setup-buttons'>
                <Button
                    appearance = 'subtle'
                    onClick = { onSuccess }>
                    { t('buttons.skip') }
                </Button>
            </div>
        </div>
    );
}

PairRemote.propTypes = {
    code: PropTypes.string,
    isPairingComplete: PropTypes.bool,
    onSuccess: PropTypes.func,
    t: PropTypes.func
};

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
        isPairingComplete: isPermanentRemotePaired(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(PairRemote));
