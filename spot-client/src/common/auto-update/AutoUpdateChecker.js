import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getUpdateEndHour, getUpdateStartHour } from 'common/app-state';
import { date } from 'common/date';
import { logger } from 'common/logger';

import TimeRangePoller from './TimeRangePoller';

const lastLoadTime = date.getCurrentDate();

/**
 * Periodically checks for when the last time the page was loaded and will
 * reload if it has been 24 hours. This reload is to get any bundle updates and
 * to clear any memory leaks.
 *
 * @extends React.Component
 */
export class AutoUpdateChecker extends React.Component {
    static propTypes = {
        onUpdateAvailable: PropTypes.func,
        updateEndHour: PropTypes.number,
        updateStartHour: PropTypes.number
    };

    /**
     * Initializes a new {@code AutoUpdateChecker} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onUpdateAvailable = this._onUpdateAvailable.bind(this);

        this._poller = new TimeRangePoller({
            endHour: props.updateEndHour,
            startHour: props.updateStartHour,
            frequency: 30000
        });

        this._unsubscribePollerListener = this._poller.addListener(
            TimeRangePoller.CURRENT_TIME_WITHIN_RANGE, this._onUpdateAvailable);
    }

    /**
     * Starts an interval to check if the app should automatically reload to
     * get updates.
     *
     * @inheritdoc
     */
    componentDidMount() {
        logger.log('Starting auto update checks');

        this._poller.start();
    }

    /**
     * Clears the interval to check if the app should automatically reload to
     * get updates.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        logger.log('Stopping auto update checks');

        this._unsubscribePollerListener();
        this._poller.stop();
        this._poller = null;
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return null;
    }

    /**
     * Triggers the passed in callback notifying that an update is ready.
     *
     * @private
     * @returns {void}
     */
    _onUpdateAvailable() {
        if (!date.isDateForToday(lastLoadTime)) {
            this.props.onUpdateAvailable();
        }
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code AutoReload}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        updateEndHour: getUpdateEndHour(state),
        updateStartHour: getUpdateStartHour(state)
    };
}

export default connect(mapStateToProps)(AutoUpdateChecker);
