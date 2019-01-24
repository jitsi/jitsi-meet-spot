import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { calendarService } from 'calendars';
import { getCalendarConfig } from 'reducers';

import { AbstractLoader, generateWrapper } from './abstract-loader';

/**
 * Loads the calendar service so it can be used to interact with calendar
 * integrations.
 *
 * @extends React.Component
 */
export class CalendarLoader extends AbstractLoader {
    static propTypes = {
        ...AbstractLoader.propTypes,
        calendarConfig: PropTypes.object,
        calendarType: PropTypes.string
    };

    /**
     * Returns the props that should be passed into this loader's child
     * elements.
     *
     * @override
     */
    _getPropsForChildren() {
        return {
            calendarService
        };
    }

    /**
     * Establishes the connection to the calendar service.
     *
     * @override
     */
    _loadService() {
        calendarService.setConfig(this.props.calendarConfig);

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
        calendarConfig: getCalendarConfig(state),
        calendarType: state.calendars.calendarType
    };
}

const ConnectedCalendarLoader = connect(mapStateToProps)(CalendarLoader);

export default generateWrapper(ConnectedCalendarLoader);
