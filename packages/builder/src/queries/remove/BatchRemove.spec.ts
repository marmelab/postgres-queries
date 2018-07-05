import { batchRemove } from './BatchRemove';

describe('QUERY batchRemove', () => {
    it('should generate sql and parameter to batchRemove given single ids', () => {
        const batchRemoveQuery = batchRemove({
            primaryKey: 'id',
            returnCols: ['columna', 'columnb'],
            table: 'table',
        });

        expect(batchRemoveQuery([1, 2])).toEqual({
            parameters: {
                id1: 1,
                id2: 2,
            },
            sql:
                'DELETE FROM table WHERE id IN ($id1, $id2) RETURNING columna, columnb;',
        });
    });

    it('should generate sql and parameter to batchRemove given multikey ids', () => {
        const batchRemoveQuery = batchRemove({
            primaryKey: ['id1', 'id2'],
            returnCols: ['columna', 'columnb'],
            table: 'table',
        });

        expect(
            batchRemoveQuery([{ id1: 1, id2: 2 }, { id1: 3, id2: 4 }]),
        ).toEqual({
            parameters: {
                id11: 1,
                id12: 3,
                id21: 2,
                id22: 4,
            },
            sql:
                'DELETE FROM table WHERE id1 IN ($id11, $id12) AND id2 IN ($id21, $id22) RETURNING columna, columnb;',
        });
    });

    it('should apply permanent filters', () => {
        const batchRemoveQuery = batchRemove({
            permanentFilters: { columnc: 'foo' },
            primaryKey: ['id1', 'id2'],
            returnCols: ['columna', 'columnb'],
            table: 'table',
        });

        expect(
            batchRemoveQuery([{ id1: 1, id2: 2 }, { id1: 3, id2: 4 }]),
        ).toEqual({
            parameters: {
                columnc: 'foo',
                id11: 1,
                id12: 3,
                id21: 2,
                id22: 4,
            },
            sql:
                'DELETE FROM table WHERE id1 IN ($id11, $id12) AND id2 IN ($id21, $id22) AND columnc = $columnc RETURNING columna, columnb;',
        });
    });
});
