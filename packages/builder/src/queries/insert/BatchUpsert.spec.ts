import { BatchUpsert } from './BatchUpsert';

describe('QUERY batchUpsert', () => {
    it('shoul generate sql and parameter for batchUpserting given rows', () => {
        const batchUpsertQuery = BatchUpsert({
            table: 'table',
            primaryKey: ['id'],
            writableCols: ['columna', 'columnb'],
        });

        const { parameters, sql } = batchUpsertQuery([
            { id: 1, columna: 1, columnb: 2 },
            { id: 2, columna: 3, columnb: 4 },
        ]);

        expect(parameters).toEqual({
            columna1: 1,
            columna2: 3,
            columnb1: 2,
            columnb2: 4,
            id1: 1,
            id2: 2,
        });

        expect(sql).toEqual(`INSERT INTO table(id, columna, columnb)
VALUES ($id1, $columna1, $columnb1), ($id2, $columna2, $columnb2)
ON CONFLICT (id)
DO UPDATE SET columna = EXCLUDED.columna, columnb = EXCLUDED.columnb
RETURNING *`);
    });
});
