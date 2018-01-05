import React from 'react';

import { CalendarStatus, ResetState } from 'features/admin';

import View from './view';

export default class CalendarView extends React.Component {
    render() {
        return (
            <View>
                <CalendarStatus />
                <ResetState />
            </View>
        );
    }
}
