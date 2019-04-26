import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    getCalendarConfig,
    getCalendarEmail,
    getCalendarType,
    getJwt,
    isSetupComplete,
    setCalendarEvents,
    setCalendarError
} from 'common/app-state';
import { AbstractLoader, generateWrapper } from 'common/ui';

import { calendarService, SERVICE_UPDATES } from './../../calendars';

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
        calendarEmail: PropTypes.string,
        calendarType: PropTypes.string,
        jwt: PropTypes.string
    };

    /**
     * Initializes a new {@code CalendarLoader} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props, 'Calendar');

        this._onEventsError = this._onEventsError.bind(this);
        this._onEventsUpdated = this._onEventsUpdated.bind(this);
    }

    /**
     * Registers listeners to act on updates from {@code calendarService}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        super.componentDidMount();

        calendarService.addListener(
            SERVICE_UPDATES.EVENTS_ERROR,
            this._onEventsError
        );
        calendarService.addListener(
            SERVICE_UPDATES.EVENTS_UPDATED,
            this._onEventsUpdated
        );
    }

    /**
     * Stops listening to {@code calendarService}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        calendarService.removeListener(
            SERVICE_UPDATES.EVENTS_ERROR,
            this._onEventsError
        );
        calendarService.removeListener(
            SERVICE_UPDATES.EVENTS_UPDATED,
            this._onEventsUpdated
        );

        calendarService.stopPollingForEvents();
    }

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

        return calendarService.initialize(this.props.calendarType)
            .then(() => {
                if (isSetupComplete && this.props.calendarEmail) {
                    calendarService.startPollingForEvents({
                        email: this.props.calendarEmail,
                        jwt: this.props.jwt
                    });
                }
            });
    }

    /**
     * Callback invoked when the {@code calendarService} has detected a change
     * in calendar events.
     *
     * @param {Object} data - The update which includes new events.
     * @private
     * @returns {void}
     */
    _onEventsUpdated(data) {
        this.props.dispatch(setCalendarEvents(data.events));
    }

    /**
     * Callback invoked when the {@code calendarService} has detected an error
     * with calendar events.
     *
     * @param {Object} data - The update which includes the error.
     * @private
     * @returns {void}
     */
    _onEventsError(data) {
        this.props.dispatch(setCalendarError(data.error));
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
        calendarEmail: getCalendarEmail(state),
        calendarType: getCalendarType(state),
        isSetupComplete: isSetupComplete(state),
        jwt: getJwt(state)
    };
}

const ConnectedCalendarLoader = connect(mapStateToProps)(CalendarLoader);

export default generateWrapper(ConnectedCalendarLoader);
