import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { ResetState } from 'common/ui';

import AdminEntry from './admin-entry';

/**
 * Implements an admin modal entry to reset the app state.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
function ResetApp({ t }) {
    return (
        <AdminEntry entryLabel = { t('admin.reset') }>
            <ResetState />
        </AdminEntry>
    );
}

ResetApp.propTypes = {
    t: PropTypes.func
};

export default withTranslation()(ResetApp);
