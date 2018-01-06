import React from 'react';

import { CalendarStatus, ResetState } from 'features/admin';

import View from './view';
import styles from './view.css';

export default class CalendarView extends React.Component {
    render() {
        return (
            <View>
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
