import dayjs from 'dayjs';

/**
 * A collection of helpers for working with the native {@code Date}.
 */
export default {
    /**
     * Converts the provided {@code Date} instance into a "week day, month day"
     * format.
     *
     * @param date - An instance of {@code Date}.
     * @returns
     */
    formatToCalendarDateWithDay(date: Date): string {
        return dayjs(date).format('ddd, MMM D');
    },

    formatToCalendarDate(date: Date): string {
        return dayjs(date).format('MMM D, YYYY');
    },

    /**
     * Converts the provided {@code Date} instance into a "hour:minute" format.
     *
     * @param date - An instance of {@code Date}.
     * @returns
     */
    formatToTime(date: Date): string {
        return dayjs(date).format('hh:mmA');
    },

    /**
     * Returns an instance of {@code Date} with the current time.
     *
     * @returns
     */
    getCurrentDate(): Date {
        return new Date();
    },

    /**
     * Calculates and returns the end time of the current day.
     *
     * @param date - An instance of {@code Date}.
     * @returns
     */
    getEndOfDate(date: Date): Date {
        return dayjs(date)
            .endOf('day')
            .toDate();
    },

    /**
     * Returns whether or not the passed in date occurs within the current day.
     *
     * @param date - An instance of {@code Date}.
     * @returns
     */
    isDateForToday(date: Date): boolean {
        return dayjs(date).isSame(dayjs(), 'day');
    }
};
