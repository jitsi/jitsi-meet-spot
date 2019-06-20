import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getUpdateEndHour, getUpdateStartHour } from 'common/app-state';
import { logger } from 'common/logger';
import { date } from 'common/utils';


const checkInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

const lastLoadTime = new Date();

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

        this._updateCheckInterval = null;

        this._checkIfUpdateReady = this._checkIfUpdateReady.bind(this);
    }

    /**
     * Starts an interval to check if the app should automatically reload to
     * get updates.
     *
     * @inheritdoc
     */
    componentDidMount() {
        logger.log('Starting auto update checks');

        this._startUpdateChecks();
    }

    /**
     * Clears the interval to check if the app should automatically reload to
     * get updates.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        logger.log('Stopping auto update checks');

        this._stopUpdateChecks();
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
     * Checks if it is time to reload and executes the reload.
     *
     * @private
     * @returns {void}
     */
    _checkIfUpdateReady() {
        const now = new Date();
        const currentHour = now.getHours();

        if (currentHour > this.props.updateStartHour
            && currentHour < this.props.updateEndHour
            && !date.isDateForToday(lastLoadTime)) {
            this.props.onUpdateAvailable();
        }
    }

    /**
     * Starts an interval to check if the page should automatically update.
     *
     * @private
     * @returns {void}
     */
    _startUpdateChecks() {
        this._stopUpdateChecks();

        this._updateCheckInterval = setInterval(
            this._checkIfUpdateReady,
            checkInterval
        );
    }

    /**
     * Stops any active interval to check if the page should automatically
     * update.
     *
     * @private
     * @returns {void}
     */
    _stopUpdateChecks() {
        clearInterval(this._updateCheckInterval);
        this._updateCheckInterval = null;
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
