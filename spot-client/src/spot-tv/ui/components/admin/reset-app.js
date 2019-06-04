import React from 'react';

import { ResetState } from 'common/ui';

import AdminEntry from './admin-entry';

/**
 * Implements an admin modal entry to reset the app state.
 */
class ResetApp extends React.Component {
    /**
     * Implements {@code Component#render}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <AdminEntry entryLabel = 'Reset app'>
                <ResetState />
            </AdminEntry>
        );
    }
}

export default ResetApp;
