import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { Button } from 'common/ui';

import AdminEntry from './admin-entry';

/**
 * A component intended to display the admin entry to directly access the preferred devices modal.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function PreferredDevices({ onClick, t }) {
    return (
        <AdminEntry entryLabel = { t('admin.devices') }>
            <Button
                className = 'device-selection-button'
                onClick = { onClick }
                qaId = 'device-selection-button'>
                { t('admin.change') }
            </Button>
        </AdminEntry>
    );
}

PreferredDevices.propTypes = {
    onClick: PropTypes.func,
    t: PropTypes.func
};

export default withTranslation()(PreferredDevices);
