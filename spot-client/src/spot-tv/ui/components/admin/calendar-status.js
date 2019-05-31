import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getCalendarEmail } from 'common/app-state';

import AdminEntry from './admin-entry';

/**
 * A component intended for displaying information about the calendar currently
 * configured for Spot.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function CalendarStatus(props) {
    return (
        <AdminEntry entryLabel = 'Calendar Status'>
            Current Calendar: { props.calendarEmail || 'None' }
        </AdminEntry>
    );
}

CalendarStatus.propTypes = {
    calendarEmail: PropTypes.string
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
