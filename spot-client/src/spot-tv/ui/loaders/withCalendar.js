import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    calendarTypes,
    getCalendarConfig,
    getCalendarEmail,
    getCalendarType,
    getJwt,
    getMeetingDomainsWhitelist,
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
     * Tries to start the event polling if it has not been started already.
     *
     * @returns {void}
     */
    componentDidUpdate() {
        this.maybeStartPolling();
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
        calendarService.setConfig(
            this.props.calendarConfig,
            this.props.meetingsDomainsWhitelist
        );

        return calendarService.initialize(this.props.calendarType)
            .then(() => {
                this.maybeStartPolling();
            });
    }

    /**
     * Starts the events polling if all underlying conditions have been met.
     *
     * @returns {void}
     */
    maybeStartPolling() {
        if (this.props.isSetupComplete && this.state.loaded) {
            // Calling startPollingForEvents multiple times is ok, because the calendar service is smart
            // and will no-op if the polling is running already
            calendarService.startPollingForEvents({
                email: this.props.calendarEmail,
                jwt: this.props.jwt
            });
        }
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
    const calendarEmail = getCalendarEmail(state);
    const calendarType = getCalendarType(state);
    const jwt = getJwt(state);

    return {
        calendarConfig: getCalendarConfig(state),
        calendarEmail,
        calendarType: getCalendarType(state),
        isSetupComplete:
            isSetupComplete(state)
                && ((calendarType === calendarTypes.BACKEND && Boolean(jwt))
                        || Boolean(calendarEmail)),
        jwt,
        meetingsDomainsWhitelist: getMeetingDomainsWhitelist(state)
    };
}

const ConnectedCalendarLoader = connect(mapStateToProps)(CalendarLoader);

export default generateWrapper(ConnectedCalendarLoader);
