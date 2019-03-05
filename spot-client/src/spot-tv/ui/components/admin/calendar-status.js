import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getCalendarEmail } from 'common/app-state';

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
        <div className = 'admin-container'>
            <div className = 'admin-title'>
                Calendar Status
            </div>
            <div className = 'admin-content'>
                <div className = 'admin-detail'>
                    Current Calendar: { props.calendarEmail }
                </div>
            </div>
        </div>
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
