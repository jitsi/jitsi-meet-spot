import { ROUTES } from 'common/routing';
import { Button } from 'common/ui';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';


import AdminEntry from './admin-entry';

interface IProps {
    t: (key: string) => string;
}

/**
 * A component intended to display the admin entry to launch the setup wizard.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function SetupWizard({ t }: IProps) {
    return (
        <AdminEntry entryLabel = { t('admin.wizard') }>
            <Link to = { ROUTES.SETUP }>
                <Button>{ t('admin.wizardStart') }</Button>
            </Link>
        </AdminEntry>
    );
}

export default withTranslation()(SetupWizard);
