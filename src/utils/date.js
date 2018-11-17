import moment from 'moment';

/**
 * A collection of helpers for working with the native {@code Date}.
 */
export default {
    /**
     * Converts the provided {@code Date} instance into a "hour:minute" format.
     *
     * @param {Date} date
     * @returns {string}
     */
    formatToTime(date) {
        return moment(date).format('hh:mm');
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
     * @returns {Date}
     */
    getEndOfDate() {
        return moment(Date.now())
            .endOf('day')
            .toDate();
    }
};
