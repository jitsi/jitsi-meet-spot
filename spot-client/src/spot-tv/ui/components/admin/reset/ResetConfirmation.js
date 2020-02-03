import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { withTranslation } from 'react-i18next';

import { logger } from 'common/logger';
import { clearPersistedState } from 'common/utils';

import { Button } from 'common/ui/components/button';

/**
 * Displays a menu option, with confirmation, to clear all saved Spot state,
 * including any spot-tv setup.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function ResetConfirmation({ t }) {
    const [ isResetting, setIsResetting ] = useState(false);
    const [ showResetConfirmation, setShowResetConfirmation ] = useState(false);

    const onResetApp = useCallback(() => {
        logger.log('confirmed reset of application');

        setIsResetting(true);

        clearPersistedState();

        setTimeout(() => {
            logger.log('reset reloading application');

            window.location.reload();
        }, 2000);
    }, [ setIsResetting ]);
    const onToggleResetConfirmation = useCallback(() => {
        setShowResetConfirmation(!showResetConfirmation);
    }, [ showResetConfirmation ]);

    let child;

    if (isResetting) {
        child = t('admin.resetting');
    } else if (showResetConfirmation) {
        child = (
            <div>
                <Button onClick = { onResetApp }>
                    { t('buttons.confirm') }
                </Button>
                <Button
                    appearance = 'secondary'
                    onClick = { onToggleResetConfirmation }>
                    { t('buttons.cancel') }
                </Button>
            </div>
        );
    } else {
        child = (
            <Button onClick = { onToggleResetConfirmation }>
                { t('admin.reset') }
            </Button>
        );
    }

    return (
        <div className = 'admin-content'>
            { child }
        </div>
    );
}

ResetConfirmation.propTypes = {
    t: PropTypes.func
};

export default withTranslation()(ResetConfirmation);
