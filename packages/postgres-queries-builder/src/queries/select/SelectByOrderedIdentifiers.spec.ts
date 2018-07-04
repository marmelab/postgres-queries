import { selectByOrderedIdentifiers } from './SelectByOrderedIdentifiers';

describe('QUERY selectByOrderedIdentifiers', () => {
    it('should generate sql and parameter for select row by given selector list', () => {
        const selectQuery = selectByOrderedIdentifiers({
            primaryKey: 'id',
            returnCols: ['cola', 'colb'],
            table: 'table',
        });

        expect(selectQuery([1, 2])).toEqual({
            parameters: {
                id1: 1,
                id2: 2,
            },
            sql: `SELECT table.cola, table.colb
FROM table
JOIN (
VALUES ($id1, 1), ($id2, 2)
) AS x (id, ordering)
ON table.id::varchar=x.id
ORDER BY x.ordering;`,
        });
    });
});
