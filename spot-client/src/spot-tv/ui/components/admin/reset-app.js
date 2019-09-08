import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { ResetState } from 'common/ui';

import AdminEntry from './admin-entry';

/**
 * Implements an admin modal entry to reset the app state.
 */
class ResetApp extends React.Component {
    static propTypes = {
        t: PropTypes.func
    };

    /**
     * Implements {@code Component#render}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <AdminEntry entryLabel = { this.props.t('admin.reset') }>
                <ResetState />
            </AdminEntry>
        );
    }
}

export default withTranslation()(ResetApp);
