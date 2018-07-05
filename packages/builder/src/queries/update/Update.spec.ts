import { update } from './Update';

describe('QUERY update', () => {
    it('should generate sql and parameter for updating rows', () => {
        const updateQuery = update({
            filterCols: ['columnc', 'columnd'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            updateQuery({ columnc: 1, columnd: 2 }, { columna: 1, columnb: 2 }),
        ).toEqual({
            parameters: {
                columna_u: 1,
                columnb_u: 2,
                columnc: 1,
                columnd: 2,
            },
            returnOne: false,
            sql: `UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE columnc = $columnc AND columnd = $columnd
RETURNING *`,
        });
    });

    it('should allow to update filter', () => {
        const updateQuery = update({
            filterCols: ['columna', 'columnb'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            updateQuery({ columna: 1, columnb: 2 }, { columna: 3, columnb: 4 }),
        ).toEqual({
            parameters: {
                columna: 1,
                columna_u: 3,
                columnb: 2,
                columnb_u: 4,
            },
            returnOne: false,
            sql: `UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE columna = $columna AND columnb = $columnb
RETURNING *`,
        });
    });

    it('should ignore filters not in filterCols', () => {
        const updateQuery = update({
            filterCols: ['columnc'],
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            updateQuery({ columnc: 1, columna: 2 }, { columna: 1, columnb: 2 }),
        ).toEqual({
            parameters: {
                columna_u: 1,
                columnb_u: 2,
                columnc: 1,
            },
            returnOne: false,
            sql: `UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE columnc = $columnc
RETURNING *`,
        });
    });

    it('should apply permanent filters', () => {
        const updateQuery = update({
            filterCols: ['columna', 'columnb'],
            permanentFilters: { columnc: 'foo' },
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            updateQuery({ columna: 1, columnb: 2 }, { columna: 3, columnb: 4 }),
        ).toEqual({
            parameters: {
                columna: 1,
                columna_u: 3,
                columnb: 2,
                columnb_u: 4,
                columnc: 'foo',
            },
            returnOne: false,
            sql: `UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE columna = $columna AND columnb = $columnb AND columnc = $columnc
RETURNING *`,
        });
    });
});
