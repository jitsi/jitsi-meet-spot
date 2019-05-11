import dayjs from 'dayjs';

/**
 * A collection of helpers for working with the native {@code Date}.
 */
export default {
    /**
     * Converts the provided {@code Date} instance into a "week day, month day"
     * format.
     *
     * @param {Date} date - An instance of {@code Date}.
     * @returns {string}
     */
    formatToCalendarDateWithDay(date) {
        return dayjs(date).format('ddd, MMM D');
    },

    formatToCalendarDate(date) {
        return dayjs(date).format('MMM D, YYYY');
    },

    /**
     * Converts the provided {@code Date} instance into a "hour:minute" format.
     *
     * @param {Date} date - An instance of {@code Date}.
     * @returns {string}
     */
    formatToTime(date) {
        return dayjs(date).format('hh:mmA');
    },

    /**
     * Returns an instance of {@code Date} with the current time.
     *
     * @returns {Date}
     */
    getCurrentDate() {
        return new Date();
    },

    /**
     * Calculates and returns the end time of the current day.
     *
     * @param {Date} date - An instance of {@code Date}.
     * @returns {Date}
     */
    getEndOfDate(date) {
        return dayjs(date)
            .endOf('day')
            .toDate();
    },

    /**
     * Returns whether or not the passed in date occurs within the current day.
     *
     * @param {Date} date - An instance of {@code Date}.
     * @returns {boolean}
     */
    isDateForToday(date) {
        return dayjs(date).isSame(dayjs(), 'day');
    }
};
