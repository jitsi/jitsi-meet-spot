import { Button } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';


import AdminEntry from './admin-entry';

interface IProps {
    onClick?: (...args: any[]) => void;
    t?: (key: string) => string;
}

/**
 * A component intended to display the admin entry to directly access the preferred devices modal.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function PreferredDevices({ onClick, t }: IProps) {
    return (
        <AdminEntry entryLabel = { t?.('admin.devices') }>
            <Button
                className = 'device-selection-button'
                onClick = { onClick }
                qaId = 'device-selection-button'>
                { t?.('admin.change') }
            </Button>
        </AdminEntry>
    );
}

export default withTranslation()(PreferredDevices);
