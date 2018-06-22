import arrayToLitteral from './arrayToLitteral';

describe('arrayToLitteral', () => {
    it('should convert [keys] and [values] to literal', () => {
        expect(arrayToLitteral(['a', 'b'], [1, 2])).toEqual({ a: 1, b: 2 });
    });

    it('should use value for all key if it is not an array of value', () => {
        expect(arrayToLitteral(['a', 'b'], 7)).toEqual({ a: 7, b: 7 });
    });

    it('should default values to undefined if not specified', () => {
        expect(arrayToLitteral(['a', 'b'])).toEqual({
            a: undefined,
            b: undefined,
        });
    });

    it('should accept null as value', () => {
        expect(arrayToLitteral(['a', 'b'], null)).toEqual({ a: null, b: null });
    });
});
