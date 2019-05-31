import PropTypes from 'prop-types';
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
export default function PreferredDevices(props) {
    return (
        <AdminEntry entryLabel = 'Preferred devices'>
            <Button
                onClick = { props.onClick }
                qaId = 'device-selection-button'>
                Setup
            </Button>
        </AdminEntry>
    );
}

PreferredDevices.propTypes = {
    onClick: PropTypes.func
};

