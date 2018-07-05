import { curry } from './Curry';

describe('curry', () => {
    it('should return a function', () => {
        const fn = (a1, a2, a3) => [a1, a2, a3];

        expect(curry(fn)).toBeInstanceOf(Function);
    });
    describe('curried function', () => {
        const curriedFn = curry((a1, a2, a3) => [a1, a2, a3]);

        it('should return a function if called with not enough parameter', () => {
            expect(curriedFn(1)).toBeInstanceOf(Function);
            expect(curriedFn(1, 2)).toBeInstanceOf(Function);
        });

        it('should execute function once given enough parameter', () => {
            expect(curriedFn(1, 2, 3)).toEqual([1, 2, 3]);
            expect(curriedFn(1)(2, 3)).toEqual([1, 2, 3]);
            expect(curriedFn(1, 2)(3)).toEqual([1, 2, 3]);
            expect(curriedFn(1)(2)(3)).toEqual([1, 2, 3]);
        });

        it('should conserve parameter order', () => {
            expect(curriedFn(1)(2)(3)).toEqual([1, 2, 3]);
            expect(curriedFn(3)(2)(1)).toEqual([3, 2, 1]);
            expect(curriedFn(2)(3)(1)).toEqual([2, 3, 1]);
        });
    });
});
