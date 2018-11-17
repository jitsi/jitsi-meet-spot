import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getCalendarName } from 'reducers';

import styles from './admin.css';

export function CalendarStatus(props) {
    return (
        <div className = { styles.container }>
            <div className = { styles.title }>
                Calendar Status
            </div>
            <div className = { styles.content }>
                <div className = { styles.detail }>
                    Current Calendar: { props.calendarName }
                </div>
            </div>
        </div>
    );
}

CalendarStatus.propTypes = {
    calendarName: PropTypes.string.isRequired
};

function mapStateToProps(state) {
    return {
        calendarName: getCalendarName(state)
    };
}

export default connect(mapStateToProps)(CalendarStatus);
