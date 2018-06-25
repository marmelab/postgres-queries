import { batchParameter } from './BatchParameter';

describe('batchParameter', () => {
    it('should return batchParameter', () => {
        expect(
            batchParameter(['a', 'b', 'c'])([
                { a: 1, b: 2, c: 3 },
                { a: 11, b: 12, c: 13, d: 'ignored' },
                { a: 21, b: 22 },
            ]),
        ).toEqual({
            a1: 1,
            a2: 11,
            a3: 21,
            b1: 2,
            b2: 12,
            b3: 22,
            c1: 3,
            c2: 13,
            c3: null,
        });
    });
});
