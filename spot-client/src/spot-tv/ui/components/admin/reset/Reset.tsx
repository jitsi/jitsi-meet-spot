import React from 'react';
import { withTranslation } from 'react-i18next';

import AdminEntry from '../admin-entry';

import ResetConfirmation from './ResetConfirmation';


interface IProps {

    /**
     * Invoked to obtain translated strings.
     */
    t: (key: string) => string;
}

/**
 * Implements an admin modal entry to reset the app state.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
function Reset({ t }: IProps) {
    return (
        <AdminEntry entryLabel = { t('admin.reset') }>
            <ResetConfirmation />
        </AdminEntry>
    );
}

export default withTranslation()(Reset);
