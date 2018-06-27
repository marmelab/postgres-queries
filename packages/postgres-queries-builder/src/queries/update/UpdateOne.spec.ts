import { updateOne } from './UpdateOne';

describe('QUERY updateOne', () => {
    it('shoul generate sql and parameter for updating one row', () => {
        const updateOneQuery = updateOne({
            primaryKey: ['id'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(updateOneQuery(1, { columna: 1, columnb: 2 })).toEqual({
            parameters: {
                columna_u: 1,
                columnb_u: 2,
                id: 1,
            },
            returnOne: true,
            sql: `UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE id = $id
RETURNING *`,
        });
    });

    it('should accept a single value as primaryKey', () => {
        const updateOneQuery = updateOne({
            primaryKey: 'uid',
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(updateOneQuery(1, { columna: 1, columnb: 2 })).toEqual({
            parameters: {
                columna_u: 1,
                columnb_u: 2,
                uid: 1,
            },
            returnOne: true,
            sql: `UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE uid = $uid
RETURNING *`,
        });
    });

    it('should accept multiple id', () => {
        const updateOneQuery = updateOne({
            primaryKey: ['id', 'uid'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            updateOneQuery({ id: 1, uid: 2 }, { columna: 1, columnb: 2 }),
        ).toEqual({
            parameters: {
                columna_u: 1,
                columnb_u: 2,
                id: 1,
                uid: 2,
            },
            returnOne: true,
            sql: `UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE id = $id AND uid = $uid
RETURNING *`,
        });
    });

    it('should ignore identifier not in primaryKey', () => {
        const updateOneQuery = updateOne({
            primaryKey: ['id'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            updateOneQuery({ id: 1, uid: 2 }, { columna: 1, columnb: 2 }),
        ).toEqual({
            parameters: {
                columna_u: 1,
                columnb_u: 2,
                id: 1,
            },
            returnOne: true,
            sql: `UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE id = $id
RETURNING *`,
        });
    });

    it('should throw an error if given identifier does not match primaryKey', () => {
        const updateOneQuery = updateOne({
            primaryKey: ['uid', 'id'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(() =>
            updateOneQuery({ id: 1 }, { columna: 1, columnb: 2 }),
        ).toThrow('Given object: (id) does not match keys: (uid, id)');
    });

    it('should not update column that have no value', () => {
        const updateOneQuery = updateOne({
            primaryKey: ['id', 'uid'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(updateOneQuery({ id: 1, uid: 2 }, { columna: 1 })).toEqual({
            parameters: {
                columna_u: 1,
                id: 1,
                uid: 2,
            },
            returnOne: true,
            sql: `UPDATE table
SET columna=$columna_u
WHERE id = $id AND uid = $uid
RETURNING *`,
        });
    });

    it('should allow to set value to null', () => {
        const updateOneQuery = updateOne({
            primaryKey: ['id', 'uid'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            updateOneQuery({ id: 1, uid: 2 }, { columna: 1, columnb: null }),
        ).toEqual({
            parameters: {
                columna_u: 1,
                columnb_u: null,
                id: 1,
                uid: 2,
            },
            returnOne: true,
            sql: `UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE id = $id AND uid = $uid
RETURNING *`,
        });
    });

    it('should apply permanent filters', () => {
        const updateOneQuery = updateOne({
            permanentFilters: { columnc: 'foo', columnd: 'bar' },
            primaryKey: ['id', 'uid'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            updateOneQuery({ id: 1, uid: 2 }, { columna: 1, columnb: null }),
        ).toEqual({
            parameters: {
                columna_u: 1,
                columnb_u: null,
                columnc: 'foo',
                columnd: 'bar',
                id: 1,
                uid: 2,
            },
            returnOne: true,
            sql: `UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE id = $id AND uid = $uid AND columnc = $columnc AND columnd = $columnd
RETURNING *`,
        });
    });
});
