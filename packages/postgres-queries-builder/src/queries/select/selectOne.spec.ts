import { selectOne } from './selectOne';

describe('QUERY selectOne', () => {
    it('should generate sql and parameter for selecting one row', () => {
        const selectOneQuery = selectOne({
            primaryKey: ['id1', 'id2'],
            returnCols: ['columna', 'columnb'],
            table: 'table',
        });

        expect(selectOneQuery({ id1: 1, id2: 2 })).toEqual({
            parameters: {
                id1: 1,
                id2: 2,
            },
            returnOne: true,
            sql:
                'SELECT columna, columnb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
        });
    });

    it('should generate sql and params to select one row when receiving single value', () => {
        const selectOneQuery = selectOne({
            primaryKey: 'username',
            returnCols: ['*'],
            table: 'bib_user',
        });

        expect(selectOneQuery('john')).toEqual({
            parameters: {
                username: 'john',
            },
            returnOne: true,
            sql: 'SELECT * FROM bib_user WHERE username = $username LIMIT 1',
        });
    });

    it('should ignore parameters not in primaryKey', () => {
        const selectOneQuery = selectOne({
            primaryKey: ['id1', 'id2'],
            returnCols: ['columna', 'columnb'],
            table: 'table',
        });

        expect(
            selectOneQuery({ id1: 1, id2: 2, columna: 'a', columnb: 'b' }),
        ).toEqual({
            parameters: {
                id1: 1,
                id2: 2,
            },
            returnOne: true,
            sql:
                'SELECT columna, columnb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
        });
    });

    it('should generate sql and parameter with permanent filters', () => {
        const selectOneQuery = selectOne({
            permanentFilters: {
                bar: 'IS NULL',
                foo: 'bar',
                tor: 'IS NOT NULL',
            },
            primaryKey: ['id1'],
            returnCols: ['columna', 'columnb'],
            table: 'table',
        });

        expect(selectOneQuery({ id1: 1 })).toEqual({
            parameters: {
                bar: 'IS NULL',
                foo: 'bar',
                id1: 1,
                tor: 'IS NOT NULL',
            },
            returnOne: true,
            sql:
                'SELECT columna, columnb FROM table WHERE id1 = $id1 AND bar IS NULL AND foo = $foo AND tor IS NOT NULL LIMIT 1',
        });
    });
});
