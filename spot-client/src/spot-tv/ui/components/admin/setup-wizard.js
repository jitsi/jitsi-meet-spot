import React from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from 'common/routing';
import { Button } from 'common/ui';

import AdminEntry from './admin-entry';

/**
 * A component intended to display the admin entry to launch the setup wizard.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export default function SetupWizard() {
    return (
        <AdminEntry entryLabel = 'Setup wizard'>
            <Link to = { ROUTES.SETUP }>
                <Button>Start wizard</Button>
            </Link>
        </AdminEntry>
    );
}

