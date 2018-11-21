import date from './date';

describe('formatToTime', () => {
    test('returns the time in hh:mm format', () => {
        const testDate = new Date();
        testDate.setMonth(11);
        testDate.setDate(20);
        testDate.setHours(19);
        testDate.setMinutes(17);

        expect(date.formatToTime(testDate)).toBe('07:17');
    });
});

describe('getEndOfDate', () => {
    test('returns a date object set to the end of the passed-in day', () => {
        const testDate = new Date();
        testDate.setMonth(11);
        testDate.setDate(20);
        testDate.setHours(19);
        testDate.setMinutes(17);
        testDate.setFullYear(2018);

        const calculatedDate = date.getEndOfDate(testDate);

        expect(calculatedDate.getFullYear()).toBe(2018);
        expect(calculatedDate.getMonth()).toBe(11);
        expect(calculatedDate.getDate()).toBe(20);
        expect(calculatedDate.getHours()).toBe(23);
        expect(calculatedDate.getMinutes()).toBe(59);
    });
});
