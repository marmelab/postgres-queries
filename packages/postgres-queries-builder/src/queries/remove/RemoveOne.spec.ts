import { removeOne } from './RemoveOne';

describe('QUERY removeOne', () => {
    it('should generate sql and parameter for selecting one row', () => {
        const removeOneQuery = removeOne({
            primaryKey: ['id1', 'id2'],
            returnCols: ['columna', 'columnb'],
            table: 'table',
        });

        expect(removeOneQuery({ id1: 1, id2: 2 })).toEqual({
            parameters: {
                id1: 1,
                id2: 2,
            },
            returnOne: true,
            sql:
                'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING columna, columnb',
        });
    });

    it('should ignore parameters not in selectors', () => {
        const removeOneQuery = removeOne({
            primaryKey: ['id1', 'id2'],
            returnCols: ['*'],
            table: 'table',
        });

        expect(
            removeOneQuery({ id1: 1, id2: 2, columna: 'a', columnb: 'b' }),
        ).toEqual({
            parameters: {
                id1: 1,
                id2: 2,
            },
            returnOne: true,
            sql:
                'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING *',
        });
    });

    it('should apply permanent filters', () => {
        const removeOneQuery = removeOne({
            permanentFilters: { columnc: 'foo' },
            primaryKey: ['id1', 'id2'],
            returnCols: ['columna', 'columnb'],
            table: 'table',
        });

        expect(removeOneQuery({ id1: 1, id2: 2 })).toEqual({
            parameters: {
                columnc: 'foo',
                id1: 1,
                id2: 2,
            },
            returnOne: true,
            sql:
                'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 AND columnc = $columnc RETURNING columna, columnb',
        });
    });
});
