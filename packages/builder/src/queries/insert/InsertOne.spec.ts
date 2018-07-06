import { insertOne } from './InsertOne';

describe('QUERY insertOne', () => {
    it('should generate sql and parameter for inserting one row', () => {
        const insertOneQuery = insertOne({
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(insertOneQuery({ columna: 'a', columnb: 'b' })).toEqual({
            parameters: {
                columna: 'a',
                columnb: 'b',
            },
            returnOne: true,
            sql:
                'INSERT INTO table\n(columna, columnb)\nVALUES($columna, $columnb)\nRETURNING *',
        });
    });

    it('should ignore parameter not in column', () => {
        const insertOneQuery = insertOne({
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(
            insertOneQuery({ columna: 'a', columnb: 'b', columnc: 'ignored' }),
        ).toEqual({
            parameters: {
                columna: 'a',
                columnb: 'b',
            },
            returnOne: true,
            sql:
                'INSERT INTO table\n(columna, columnb)\nVALUES($columna, $columnb)\nRETURNING *',
        });
    });

    it('should ignore missing parameter', () => {
        const insertOneQuery = insertOne({
            table: 'table',
            writableCols: ['columna', 'columnb'],
        });

        expect(insertOneQuery({ columna: 'a' })).toEqual({
            parameters: {
                columna: 'a',
            },
            returnOne: true,
            sql: 'INSERT INTO table\n(columna)\nVALUES($columna)\nRETURNING *',
        });
    });
});
