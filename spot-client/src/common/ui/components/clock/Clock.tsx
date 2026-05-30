import { date } from 'common/date';
import React from 'react';


/**
 * The state of the {@code Clock} component.
 */
interface IState {
    calendarDate: string;
    time: string;
}

/**
 * Displays the current time and updates itself at an interval.
 *
 */
export default class Clock extends React.Component<Record<string, never>, IState> {
    _dateUpdateInterval: ReturnType<typeof setInterval> | null;

    /**
     * Initializes a new {@code Clock} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Record<string, never>) {
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
        if (this._dateUpdateInterval) {
            clearInterval(this._dateUpdateInterval);
        }
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
     * @returns
     */
    _getClockValues(): IState {
        return {
            calendarDate: this._getCalendarDate(),
            time: this._getTime()
        };
    }

    /**
     * Returns the current date in "d, M D" format.
     *
     * @private
     * @returns
     */
    _getCalendarDate(): string {
        return date.formatToCalendarDateWithDay(date.getCurrentDate());
    }

    /**
     * Returns the current time in "H:MMA" format.
     *
     * @private
     * @returns
     */
    _getTime(): string {
        return date.formatToTime(date.getCurrentDate());
    }
}
