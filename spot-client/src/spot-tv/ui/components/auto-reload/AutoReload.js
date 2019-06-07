import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getSpotServicesConfig,
    getUpdateEndHour,
    getUpdateStartHour
} from 'common/app-state';
import { scheduleSpotTVUpdate } from '../../../app-state';

const checkInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
const reloadThreshold = 23 * 60 * 60 * 1000; // 23 hours in milliseconds

const lastLoadTime = new Date();

/**
 * Periodically checks for when the last time the page was loaded and will
 * reload if it has been 24 hours. This reload is to get any bundle updates and
 * to clear any memory leaks.
 *
 * @extends React.Component
 */
export class AutoReload extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        onReload: PropTypes.func,
        updateEndHour: PropTypes.number,
        updateStartHour: PropTypes.number
    };

    /**
     * Initializes a new {@code AutoReload} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._reloadTimeCheckInterval = null;

        this._maybeReload = this._maybeReload.bind(this);
    }

    /**
     * Starts an interval to check if the app should automatically reload.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (this.props.enabled) {
            this._reloadTimeCheckInterval = setInterval(
                this._maybeReload,
                checkInterval
            );
        }
    }

    /**
     * Clears the interval to check if the app should automatically reload.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearInterval(this._reloadTimeCheckInterval);
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
    _maybeReload() {
        const now = new Date();
        const currentHour = now.getHours();

        if (currentHour > this.props.updateStartHour
            && currentHour < this.props.updateEndHour
            && now.getTime() - lastLoadTime.getTime() >= reloadThreshold) {
            this.props.onReload();
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
    const spotServicesConfig = getSpotServicesConfig(state);

    return {
        enabled:
            !spotServicesConfig || !spotServicesConfig.joinCodeServiceUrl,
        updateEndHour: getUpdateEndHour(state),
        updateStartHour: getUpdateStartHour(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        onReload() {
            dispatch(scheduleSpotTVUpdate());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoReload);
