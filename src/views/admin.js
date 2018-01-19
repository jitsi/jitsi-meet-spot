import React from 'react';

import { CalendarStatus, ResetState } from 'features/admin';

import View from './view';
import styles from './view.css';

export default class AdminView extends React.Component {
    render() {
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
}
