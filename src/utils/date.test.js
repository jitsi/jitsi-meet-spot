import date from './date';

describe('formatToTime', () => {
    test('returns the time in hh:mm format', () => {
        expect(date.formatToTime(1542683873254)).toBe('07:17');
    });
});

describe('getEndOfDate', () => {
    test('returns a date object set to the end of the passed-in day', () => {
        const testDate = new Date(1542683873254);
        const calculatedDate = date.getEndOfDate(testDate);
        const expectedDate = new Date(1542700799999);

        expect(calculatedDate.getTime()).toBe(expectedDate.getTime());
    });
});
