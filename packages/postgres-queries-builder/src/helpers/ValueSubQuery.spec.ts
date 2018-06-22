import { valueSubQuery } from './ValueSubQuery';

describe('valueSubQuery', () => {
    it('should return subQuery filtering out unwanted column', () => {
        expect(valueSubQuery(['login', 'first_name'], '5')).toEqual(
            '$login5, $first_name5',
        );
    });
});
