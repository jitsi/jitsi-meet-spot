import { ROUTES } from 'common/routing';
import { Button } from 'common/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';


import AdminEntry from './admin-entry';

/**
 * A component intended to display the admin entry to launch the setup wizard.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function SetupWizard({ t }) {
    return (
        <AdminEntry entryLabel = { t('admin.wizard') }>
            <Link to = { ROUTES.SETUP }>
                <Button>{ t('admin.wizardStart') }</Button>
            </Link>
        </AdminEntry>
    );
}

SetupWizard.propTypes = {
    t: PropTypes.func
};

export default withTranslation()(SetupWizard);
