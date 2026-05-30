import { date } from './../date';
import { Emitter } from './../emitter';

const defaultFrequency = 5 * 60 * 1000; // 5 minutes in milliseconds

interface ITimeRangePollerOptions {
    /**
     * The hour at the end of the range for which to check if the current time
     * falls into.
     */
    endHour: number;

    /**
     * The rate, in milliseconds, at which to check for the time.
     */
    frequency?: number;

    /**
     * The hour at the start of the range for which to check if the current time
     * falls into.
     */
    startHour: number;
}

/**
 * Polls for if the current time falls within a provided range of hours.
 */
export default class TimeRangePoller extends Emitter {
    static TIME_WITHIN_RANGE_UPDATE = 'TIME_WITHIN_RANGE_UPDATE';

    private _endHour: number;
    private _frequency: number;
    private _startHour: number;
    private _dateCheckInterval: ReturnType<typeof setInterval> | null;
    private _isWithinRange: boolean;

    /**
     * Initializes a new {@code TimeRangePoller} instance.
     *
     * @param options - Attributes to initialize the instance with.
     * @param options.endHour - The hour at the end of the range for
     * which to check if the current time falls into.
     * @param [options.frequency] - The rate, in milliseconds, at which
     * to check for the time.
     * @param options.startHour - The hour at the start of the range
     * for which to check if the current time falls into.
     */
    constructor(options: ITimeRangePollerOptions) {
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
    start(): void {
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
    stop(): void {
        if (this._dateCheckInterval) {
            clearInterval(this._dateCheckInterval);
        }
        this._dateCheckInterval = null;
    }

    /**
     * Checks if the current time falls within the configured time range.
     *
     * @returns {void}
     */
    _check(): void {
        const now = date.getCurrentDate();
        const currentHour = now.getHours();
        const newIsWithingRange = currentHour >= this._startHour && currentHour < this._endHour;

        if (this._isWithinRange !== newIsWithingRange) {
            this._isWithinRange = newIsWithingRange;
            this.emit(TimeRangePoller.TIME_WITHIN_RANGE_UPDATE, newIsWithingRange);
        }
    }
}
