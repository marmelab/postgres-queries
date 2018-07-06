import { returningQuery } from './ReturningQuery';

describe('returningQuery', () => {
    it('should return RETURNING clause with given cols', () => {
        expect(returningQuery(['column1', 'column2'])).toEqual(
            'RETURNING column1, column2',
        );
    });

    it('should return RETURNING * clause if received nothing', () => {
        expect(returningQuery()).toEqual('RETURNING *');
    });

    it('should return `` clause if received empty array', () => {
        expect(returningQuery([])).toEqual('');
    });
});
