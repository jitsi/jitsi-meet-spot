import React from 'react';

import { CalendarStatus, ResetState } from 'features/admin';

import View from './view';
import styles from './view.css';

/**
 * A component for providing post-setup application configuration.
 *
 * @returns {ReactElement}
 */
export default function AdminView() {
    return (
        <View name = 'admin'>
            <div className = { styles.container }>
                <div className = { styles.admin }>
                    <CalendarStatus />
                    <ResetState />
                </div>
            </div>
        </View>
    );
}
