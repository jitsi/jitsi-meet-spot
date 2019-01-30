import date from './date';

/**
 * Create a date with a set time, regardless of local timezone.
 *
 * @returns {Date}
 */
function createTestDate() {
    const testDate = new Date();

    testDate.setMonth(11);
    testDate.setDate(20);
    testDate.setHours(19);
    testDate.setMinutes(17);
    testDate.setFullYear(2018);

    return testDate;
}

describe('formatToTime', () => {
    test('returns the time in hh:mm format', () => {
        expect(date.formatToTime(createTestDate())).toBe('07:17');
    });
});

describe('getEndOfDate', () => {
    test('returns a date object set to the end of the passed-in day', () => {
        const calculatedDate = date.getEndOfDate(createTestDate());

        expect(calculatedDate.getFullYear()).toBe(2018);
        expect(calculatedDate.getMonth()).toBe(11);
        expect(calculatedDate.getDate()).toBe(20);
        expect(calculatedDate.getHours()).toBe(23);
        expect(calculatedDate.getMinutes()).toBe(59);
    });
});
