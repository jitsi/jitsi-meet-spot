import React from 'react';

import { CalendarAccountStatus } from 'features/calendar-account';

import View from './view';

export default class CalendarView extends React.Component {
    render() {
        return (
            <View>
                Debug and settings
                <CalendarAccountStatus />
            </View>
        );
    }
}
