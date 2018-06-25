import { batchInsert } from './BatchInsert';

describe('QUERY batchInsert', () => {
    it('shoul generate sql and parameter for batchInserting given rows', () => {
        const batchInsertQuery = batchInsert({
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            batchInsertQuery([
                { columna: 1, columnb: 2 },
                { columna: 3, columnb: 4 },
            ]),
        ).toEqual({
            parameters: {
                columna1: 1,
                columna2: 3,
                columnb1: 2,
                columnb2: 4,
            },
            sql:
                'INSERT INTO table(columna, columnb) VALUES ($columna1, $columnb1), ($columna2, $columnb2) RETURNING *;',
        });
    });

    it('shoul set to null if column is missing', () => {
        const batchInsertQuery = batchInsert({
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            batchInsertQuery([{ columna: 1 }, { columna: 3, columnb: 4 }]),
        ).toEqual({
            parameters: {
                columna1: 1,
                columna2: 3,
                columnb1: null,
                columnb2: 4,
            },
            sql:
                'INSERT INTO table(columna, columnb) VALUES ($columna1, $columnb1), ($columna2, $columnb2) RETURNING *;',
        });
    });
});
