const { generateTrackingNumber } = require('../src/lib');

describe('tracking number generation', () => {
    it('should work', () => {
        let result = generateTrackingNumber(
            '79588',
            '79576',
            '2018-02-21T08:19:58.442Z',
            1,
            false
        );
        expect(result).toMatch(/HMS[0-9]*/);
    });
});