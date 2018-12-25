import { connect } from 'react-redux';

import { calendarService } from 'calendars';

import { AbstractLoader, generateWrapper } from './abstract-loader';

/**
 * Loads the calendar service so it can be used to interact with calendar
 * integrations.
 *
 * @extends React.Component
 */
export class CalendarLoader extends AbstractLoader {
    static propTypes = AbstractLoader.propTypes;

    /**
     * @override
     */
    _loadService() {
        return calendarService.initialize(this.props.calendarType);
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code CalendarLoader}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        calendarType: state.calendars.calendarType
    };
}

const ConnectedCalendarLoader = connect(mapStateToProps)(CalendarLoader);

export default generateWrapper(ConnectedCalendarLoader);
