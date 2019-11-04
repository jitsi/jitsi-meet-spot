import { date } from './../date';
import { Emitter } from './../emitter';

const defaultFrequency = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Polls for if the current time falls within a provided range of hours.
 *
 * @extends Emitter
 */
export default class TimeRangePoller extends Emitter {
    static TIME_WITHIN_RANGE_UPDATE = 'TIME_WITHIN_RANGE_UPDATE';

    /**
     * Initializes a new {@code TimeRangePoller} instance.
     *
     * @param {Object} options - Attributes to initialize the instance with.
     * @param {number} options.endHour - The hour at the end of the range for
     * which to check if the current time falls into.
     * @param {Object} [options.frequency] - The rate, in milliseconds, at which
     * to check for the time.
     * @param {number} options.startHour - The hour at the start of the range
     * for which to check if the current time falls into.
     */
    constructor(options) {
        super();

        const {
            endHour,
            frequency = defaultFrequency,
            startHour
        } = options;

        this._endHour = endHour;
        this._frequency = frequency;
        this._startHour = startHour;

        this._dateCheckInterval = null;
        this._isWithinRange = false;

        this._check = this._check.bind(this);
    }

    /**
     * Starts an interval to check if the current time falls within the
     * configured time range.
     *
     * @returns {void}
     */
    start() {
        this.stop();

        this._dateCheckInterval = setInterval(
            this._check,
            this._frequency
        );
    }

    /**
     * Starts checking if the current time falls within the configured time
     * range.
     *
     * @returns {void}
     */
    stop() {
        clearInterval(this._dateCheckInterval);
        this._dateCheckInterval = null;
    }

    /**
     * Checks if the current time falls within the configured time range.
     *
     * @returns {void}
     */
    _check() {
        const now = date.getCurrentDate();
        const currentHour = now.getHours();
        const newIsWithingRange = currentHour >= this._startHour && currentHour < this._endHour;

        if (this._isWithinRange !== newIsWithingRange) {
            this._isWithinRange = newIsWithingRange;
            this.emit(TimeRangePoller.TIME_WITHIN_RANGE_UPDATE, newIsWithingRange);
        }
    }
}
