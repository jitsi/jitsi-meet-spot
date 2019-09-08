import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import React from 'react';

import { Button } from 'common/ui';

import AdminEntry from './admin-entry';

/**
 * A component intended to display the admin entry to directly access the preferred devices modal.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function PreferredDevices(props) {
    return (
        <AdminEntry entryLabel = { props.t('admin.devices') }>
            <Button
                onClick = { props.onClick }
                qaId = 'device-selection-button'>
                { props.t('admin.change') }
            </Button>
        </AdminEntry>
    );
}

PreferredDevices.propTypes = {
    onClick: PropTypes.func,
    t: PropTypes.func
};

export default withTranslation()(PreferredDevices);
