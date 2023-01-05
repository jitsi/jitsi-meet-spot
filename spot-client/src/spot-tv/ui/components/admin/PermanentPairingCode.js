import { Button, LoadingIcon } from 'common/ui';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { generateLongLivedPairingCodeIfExpired } from '../../../app-state';
import { getLongLivedPairingCodeInfo } from '../../../backend';

import AdminEntry from './admin-entry';

/**
 * Displays and refreshes the long lived code for Spot-Remotes to connect to
 * a Spot-TV.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function PermanentPairingCode(props) {
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

    let content = null;

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

PermanentPairingCode.propTypes = {
    pairingCode: PropTypes.string,
    refreshPairingCode: PropTypes.func,
    t: PropTypes.func
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code PermanentPairingCode}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const pairingInfo = getLongLivedPairingCodeInfo(state);

    return {
        pairingCode: pairingInfo && pairingInfo.code
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        refreshPairingCode() {
            return dispatch(generateLongLivedPairingCodeIfExpired());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(PermanentPairingCode)
);
