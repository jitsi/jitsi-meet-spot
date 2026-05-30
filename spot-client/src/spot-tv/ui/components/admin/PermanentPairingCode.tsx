import { Button, LoadingIcon } from 'common/ui';
import React, { useCallback, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { generateLongLivedPairingCodeIfExpired } from '../../../app-state';
import { getLongLivedPairingCodeInfo } from '../../../backend';

import AdminEntry from './admin-entry';

interface IProps {

    /**
     * The pairing code to be displayed.
     */
    pairingCode?: string;

    /**
     * Callback to refresh the pairing code.
     */
    refreshPairingCode: () => Promise<any>;

    /**
     * The translation function.
     */
    t: (key: string) => string;
}

/**
 * Displays and refreshes the long lived code for Spot-Remotes to connect to
 * a Spot-TV.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function PermanentPairingCode(props: IProps) {
    const [ isLoading, setIsLoading ] = useState(false);
    const [ displayPairingCode, setDisplayPairingCode ] = useState(false);

    const onClick = useCallback(() => {
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        props.refreshPairingCode()
            .then(() => setDisplayPairingCode(true));
    }, [ setIsLoading ]);

    let content: React.ReactNode;

    if (displayPairingCode) {
        content = (
            <span className = 'pairing-code'>
                { props.pairingCode }
            </span>
        );
    } else if (isLoading) {
        content = <LoadingIcon />;
    } else {
        content = (
            <Button onClick = { onClick }>
                { props.t('admin.display') }
            </Button>
        );
    }

    return (
        <AdminEntry entryLabel = { props.t('admin.code') }>
            { content }
        </AdminEntry>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code PermanentPairingCode}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
    const pairingInfo = getLongLivedPairingCodeInfo(state);

    return {
        pairingCode: pairingInfo && pairingInfo.code
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        refreshPairingCode() {
            return dispatch(generateLongLivedPairingCodeIfExpired());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(PermanentPairingCode)
);
