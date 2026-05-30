import { joinCodeToVersion } from './stringutils.js';

describe('joinCodeToVersion', () => {
    it('pads short codes to 8 hex digits split into two 4-char groups', () => {
        // parseInt('1', 36) === 1 -> hex '1' -> padded '00000001' -> [ '0000', '0001' ]
        expect(joinCodeToVersion('1')).toEqual([ '0000', '0001' ]);
    });

    it('produces 4-char hex groups for a longer join code', () => {
        const result = joinCodeToVersion('abc123');

        expect(result.length).toBeGreaterThan(0);
        expect(result.every(part => /^[0-9a-f]{1,4}$/.test(part))).toBe(true);
    });
});
