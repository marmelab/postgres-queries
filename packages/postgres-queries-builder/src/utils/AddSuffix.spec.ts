import { addSuffix } from './AddSuffix';

describe('batchParameter', () => {
    it('addSuffix should add given suffix to all object attributes', () => {
        expect(addSuffix({ a: 1, b: 2, c: 3 }, 56)).toEqual({
            a56: 1,
            b56: 2,
            c56: 3,
        });
    });
});
