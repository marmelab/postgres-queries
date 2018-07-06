import { checkLiteralKeys } from './CheckLiteralKeys';

describe('checkLiteralKeys', () => {
    it('should return given object if all given keys exists', () => {
        expect(
            checkLiteralKeys(['a', 'b', 'c'])({
                a: 1,
                b: 'b',
                c: 0,
            }),
        ).toEqual({
            a: 1,
            b: 'b',
            c: 0,
        });
    });

    it('should throw an error if some key are missing', () => {
        expect(() =>
            checkLiteralKeys(['a', 'b', 'c'])({
                a: 1,
                b: 'b',
            }),
        ).toThrow('Given object: (a, b) does not match keys: (a, b, c)');
    });

    it('should throw an error if some key are undefined', () => {
        expect(() =>
            checkLiteralKeys(['a', 'b', 'c'])({
                a: 1,
                b: 'b',
                c: undefined,
            }),
        ).toThrow('Given object: (a, b) does not match keys: (a, b, c)');
    });

    it('should throw an error if some key are null', () => {
        expect(() =>
            checkLiteralKeys(['a', 'b', 'c'])({
                a: 1,
                b: 'b',
                c: null,
            }),
        ).toThrow('Given object: (a, b) does not match keys: (a, b, c)');
    });

    it('should throw an error if object has more key than specified', () => {
        expect(() =>
            checkLiteralKeys(['a', 'b', 'c'])({
                a: 1,
                b: 'b',
                c: 3,
                d: 'too many',
            }),
        ).toThrow('Given object: (a, b, c, d) does not match keys: (a, b, c)');
    });
});
