import React from 'react';

import { date } from 'utils';

import styles from './clock.css';

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

        this.state = {
            time: this._getTime()
        };
    }

    /**
     * Starts an interval to update the currently displayed time.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._dateUpdateInterval = setInterval(() => {
            this.setState({ time: this._getTime() });
        }, 500);
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
            <div className = { styles.clock }>
                { this.state.time }
            </div>
        );
    }

    /**
     * Returns the current time in HH:MM format.
     *
     * @private
     * @returns {string}
     */
    _getTime() {
        return date.formatToTime(date.getCurrentDate());
    }
}
