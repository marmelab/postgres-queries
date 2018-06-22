import { remove } from './Remove';

describe('QUERY remove', () => {
    it('should generate sql and parameter for selecting one row', () => {
        const removeQuery = remove({
            filterCols: ['columnA', 'columnB', 'columnC', 'columnD'],
            returnCols: ['id'],
            table: 'table',
        });

        expect(removeQuery({ columnA: 'foo', columnC: 'bar' })).toEqual({
            parameters: {
                columnA: 'foo',
                columnC: 'bar',
            },
            returnOne: false,
            sql:
                'DELETE FROM table WHERE columnA = $columnA AND columnC = $columnC RETURNING id',
        });
    });

    it('should apply permanent filters', () => {
        const removeQuery = remove({
            filterCols: ['columnA', 'columnB', 'columnC'],
            permanentFilters: { columnD: 'thisIsIt' },
            returnCols: ['id'],
            table: 'table',
        });

        expect(removeQuery({ columnA: 'foo', columnB: 'bar' })).toEqual({
            parameters: {
                columnA: 'foo',
                columnB: 'bar',
                columnD: 'thisIsIt',
            },
            returnOne: false,
            sql:
                'DELETE FROM table WHERE columnA = $columnA AND columnB = $columnB AND columnD = $columnD RETURNING id',
        });
    });
});
