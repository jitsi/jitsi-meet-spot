import type { RootState } from 'common/app-state';
import { isPermanentRemotePaired } from 'common/app-state';
import { Button } from 'common/ui';
import React, { useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { getLongLivedPairingCodeInfo } from '../../../backend';

interface IProps {

    /**
     * The join code for a Spot-Remote to use to connect to the Spot-TV.
     */
    code?: string;

    /**
     * Whether the permanent remote pairing has completed.
     */
    isPairingComplete?: boolean;

    /**
     * Callback invoked when this setup step is finished.
     */
    onSuccess: (...args: any[]) => void;

    /**
     * The i18n translate function.
     */
    t: (key: string) => string;
}

/**
 * Displays a setup step showing a join code for a Spot-Remote to use to connect
 * to a Spot-TV.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function PairRemote(props: IProps) {
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

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code PairRemote}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        code: (getLongLivedPairingCodeInfo(state) || {}).code,
        isPairingComplete: isPermanentRemotePaired(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(PairRemote));
