import { date } from 'common/date';

const lastLoadTime = date.getCurrentDate();

export default {
    /**
     * Checks if update for the web source is available.
     *
     * @returns {boolean}
     */
    isWebUpdateAvailable() {
        // Currently there's assumption that web update is always available as long as it's been at least one day since
        // the last reload.
        return !date.isDateForToday(lastLoadTime);
    }
};
