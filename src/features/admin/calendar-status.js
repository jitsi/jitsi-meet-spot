import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getCalendarName } from 'reducers';

import styles from './admin.css';

export class CalendarStatus extends React.Component {
    static propTypes = {
        _calendarName: PropTypes.string
    };

    render() {
        const { _calendarName } = this.props;

        return (
            <div className = { styles.container }>
                <div className = { styles.title }>
                    Calendar Status
                </div>
                <div className = { styles.content }>
                    <div className = { styles.detail }>
                        calendar: { _calendarName }
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        _calendarName: getCalendarName(state)
    };
}

export default connect(mapStateToProps)(CalendarStatus);
