import { upsertOne } from './UpsertOne';

describe('QUERY upsertOne', () => {
    it('should generate sql and parameter for upserting one row', () => {
        const upsertOneQuery = upsertOne({
            primaryKey: ['id1', 'id2'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            upsertOneQuery({ id1: 1, id2: 2, columna: 'a', columnb: 'b' }),
        ).toEqual({
            parameters: {
                columna: 'a',
                columnb: 'b',
                id1: 1,
                id2: 2,
            },
            returnOne: true,
            sql: `INSERT INTO table (id1, id2, columna, columnb)
VALUES ($id1, $id2, $columna, $columnb)
ON CONFLICT (id1, id2)
DO UPDATE SET columna = $columna, columnb = $columnb
RETURNING *`,
        });
    });

    it('should generate query for upserting using same order for (column...) and VALUES(column...)', () => {
        const upsertOneQuery = upsertOne({
            primaryKey: ['id'],
            table: 'table',
            writableCols: ['column'],
        });

        expect(upsertOneQuery({ column: 'value', id: 1 })).toEqual({
            parameters: {
                column: 'value',
                id: 1,
            },
            returnOne: true,
            sql: `INSERT INTO table (id, column)
VALUES ($id, $column)
ON CONFLICT (id)
DO UPDATE SET column = $column
RETURNING *`,
        });
    });

    it('should not try to update column not passed in row', () => {
        const upsertOneQuery = upsertOne({
            primaryKey: ['id'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(upsertOneQuery({ columna: 'value', id: 1 })).toEqual({
            parameters: {
                columna: 'value',
                id: 1,
            },
            returnOne: true,
            sql: `INSERT INTO table (id, columna)
VALUES ($id, $columna)
ON CONFLICT (id)
DO UPDATE SET columna = $columna
RETURNING *`,
        });
    });

    it('should DO NOTHING on conflict when no value provided to updatable column', () => {
        const upsertOneQuery = upsertOne({
            primaryKey: ['id'],
            table: 'table',
            writableCols: ['column'],
        });

        expect(upsertOneQuery({ id: 1 })).toEqual({
            parameters: {
                id: 1,
            },
            returnOne: true,
            sql: `INSERT INTO table (id)
VALUES ($id)
ON CONFLICT (id)
DO NOTHING
RETURNING *`,
        });
    });

    it('should accept to have no writableCols', () => {
        const upsertOneQuery = upsertOne({
            primaryKey: ['id'],
            table: 'table',
            writableCols: [],
        });

        expect(upsertOneQuery({ id: 1 })).toEqual({
            parameters: {
                id: 1,
            },
            returnOne: true,
            sql: `INSERT INTO table (id)
VALUES ($id)
ON CONFLICT (id)
DO NOTHING
RETURNING *`,
        });
    });

    it('should apply permanent filters', () => {
        const upsertOneQuery = upsertOne({
            permanentFilters: { columnb: 'foo' },
            primaryKey: ['id'],
            table: 'table',
            writableCols: ['column'],
        });

        expect(upsertOneQuery({ column: 'value', id: 1 })).toEqual({
            parameters: {
                column: 'value',
                columnb: 'foo',
                id: 1,
            },
            returnOne: true,
            sql: `INSERT INTO table (id, column)
VALUES ($id, $column)
ON CONFLICT (id)
DO UPDATE SET column = $column WHERE columnb = $columnb
RETURNING *`,
        });
    });
});
