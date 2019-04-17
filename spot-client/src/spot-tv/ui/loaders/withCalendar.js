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

import { calendarService } from './../../calendars';

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

        this._onServiceEvent = this._onServiceEvent.bind(this);
    }

    /**
     * Begins interactions with the {@code calendarService}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        super.componentDidMount();

        calendarService.startListeningForEvents(this._onServiceEvent);
    }

    /**
     * Stops the {@code calendarService}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        calendarService.stopListeningForEvents(this._onServiceEvent);
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
     * Callback invoked when the {@code calendarService} has an update.
     *
     * @param {string} eventName - The type of the update.
     * @param {Object} data - Additional information describing the update.
     * @private
     * @returns {void}
     */
    _onServiceEvent(eventName, data) {
        switch (eventName) {
        case 'events-updated':
            this.props.dispatch(setCalendarEvents(data.events));
            break;

        case 'events-error':
            this.props.dispatch(setCalendarError(data.error));
            break;
        }
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
