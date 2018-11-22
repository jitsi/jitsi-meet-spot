import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getCalendarEmail } from 'reducers';

import styles from './admin.css';

/**
 * A component intended for displaying information about the calendar currently
 * configured for the application.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function CalendarStatus(props) {
    return (
        <div className = { styles.container }>
            <div className = { styles.title }>
                Calendar Status
            </div>
            <div className = { styles.content }>
                <div className = { styles.detail }>
                    Current Calendar: { props.calendarEmail }
                </div>
            </div>
        </div>
    );
}

CalendarStatus.propTypes = {
    calendarEmail: PropTypes.string.isRequired
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code CalendarStatus}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        calendarEmail: getCalendarEmail(state)
    };
}

export default connect(mapStateToProps)(CalendarStatus);
