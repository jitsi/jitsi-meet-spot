import React from 'react';

import { date } from 'common/date';

/**
 * Displays the current time and updates itself at an interval.
 *
 * @extends React.Component
 */
export default class Clock extends React.Component {
    /**
     * Initializes a new {@code Clock} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._dateUpdateInterval = null;

        this.state = this._getClockValues();
    }

    /**
     * Starts an interval to update the currently displayed time.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._dateUpdateInterval = setInterval(() => {
            this.setState(this._getClockValues());
        }, 1000);
    }

    /**
     * Clears the interval to update the currently displayed time.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearInterval(this._dateUpdateInterval);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div className = 'clock'>
                <div className = 'time'>{ this.state.time }</div>
                <div className = 'date'>{ this.state.calendarDate }</div>
            </div>
        );
    }

    /**
     * Returns a new object with values to describing the current time and date.
     *
     * @private
     * @returns {Object}
     */
    _getClockValues() {
        return {
            calendarDate: this._getCalendarDate(),
            time: this._getTime()
        };
    }

    /**
     * Returns the current date in "d, M D" format.
     *
     * @private
     * @returns {string}
     */
    _getCalendarDate() {
        return date.formatToCalendarDateWithDay(date.getCurrentDate());
    }

    /**
     * Returns the current time in "H:MMA" format.
     *
     * @private
     * @returns {string}
     */
    _getTime() {
        return date.formatToTime(date.getCurrentDate());
    }
}
