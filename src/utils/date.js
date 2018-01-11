import moment from 'moment';

export default {
    formatToTime(date) {
        return moment(date).format('hh:mm');
    },

    getCurrentDate() {
        return new Date();
    },

    getEndOfDate() {
        return moment(Date.now())
            .endOf('day')
            .toDate();
    }
};
