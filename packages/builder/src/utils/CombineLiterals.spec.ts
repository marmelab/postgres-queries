import { combineLiterals } from './CombineLiterals';

describe('combineLiterals', () => {
    it('should combine all values from keys', () => {
        expect(combineLiterals([{ a: 1, b: 2 }, { a: 3, b: 4 }])).toEqual({
            a: [1, 3],
            b: [2, 4],
        });
    });

    it('should combine all values from keys even when array', () => {
        expect(
            combineLiterals([{ a: 1, b: 2 }, { a: [3, 4], b: [5, 6] }]),
        ).toEqual({ a: [1, 3, 4], b: [2, 5, 6] });
    });

    it('should combine all values from keys even when unmatching key', () => {
        expect(
            combineLiterals([{ a: 1, b: 2 }, { b: [3, 4], c: [5, 6] }]),
        ).toEqual({ a: [1], b: [2, 3, 4], c: [5, 6] });
    });
});
