import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getUpdateEndHour, getUpdateStartHour } from 'common/app-state';
import { logger } from 'common/logger';

import TimeRangePoller from './TimeRangePoller';

/**
 * Periodically checks if the current time falls into the preconfigured time range when the updates are allowed.
 *
 * @extends React.Component
 */
export class UpdateTimeRangeChecker extends React.Component {
    static propTypes = {
        onTimeWithinRangeUpdate: PropTypes.func,
        updateEndHour: PropTypes.number,
        updateStartHour: PropTypes.number
    };

    /**
     * Initializes a new {@code UpdateTimeRangeChecker} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onTimeWithinRangeUpdate = this._onTimeWithinRangeUpdate.bind(this);

        this._poller = new TimeRangePoller({
            endHour: props.updateEndHour,
            startHour: props.updateStartHour,
            frequency: 30000
        });

        this._unsubscribePollerListener
            = this._poller.addListener(
                TimeRangePoller.TIME_WITHIN_RANGE_UPDATE,
                this._onTimeWithinRangeUpdate);
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

        this.props.onTimeWithinRangeUpdate(false);
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
     * @param {boolean} isTimeWithingRange - Whether or not the current time is within the auto update allowed time
     * range.
     * @private
     * @returns {void}
     */
    _onTimeWithinRangeUpdate(isTimeWithingRange) {
        this.props.onTimeWithinRangeUpdate(isTimeWithingRange);
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code UpdateTimeRangeChecker}.
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

export default connect(mapStateToProps)(UpdateTimeRangeChecker);
