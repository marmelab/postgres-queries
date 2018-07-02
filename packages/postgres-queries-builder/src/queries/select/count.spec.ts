import { count } from './count';

describe('QUERY count', () => {
    it('should generate SQL to count all rows if no filter is given', () => {
        const countQuery = count({ table: 'table' });

        expect(countQuery()).toEqual({
            returnOne: true,
            sql: 'SELECT COUNT(*) FROM table;',
        });
    });

    it('should generate SQL to count all row by applying permanent filters', () => {
        const countAllQuery = count({
            permanentFilters: {
                column1: 'foo',
                column2: 'bar',
            },
            table: 'table',
        });

        expect(countAllQuery()).toEqual({
            parameters: {
                column1: 'foo',
                column2: 'bar',
            },
            returnOne: true,
            sql:
                'SELECT COUNT(*) FROM table WHERE column1 = $column1 AND column2 = $column2;',
        });
    });

    it('should generate SQL query counting all records filtered by given filters', () => {
        const countQuery = count({ table: 'table' });

        expect(
            countQuery({ filters: { username: 'john.doe', department: 'HR' } }),
        ).toEqual({
            parameters: {
                department: 'HR',
                username: 'john.doe',
            },
            returnOne: true,
            sql:
                'SELECT COUNT(*) FROM table WHERE username = $username AND department = $department;',
        });
    });

    it('should generate SQL query counting all records filtered by both given filters AND permanent ones', () => {
        const countQuery = count({
            permanentFilters: {
                department: 'HR',
            },
            table: 'table',
        });

        expect(countQuery({ filters: { username: 'john.doe' } })).toEqual({
            parameters: {
                department: 'HR',
                username: 'john.doe',
            },
            returnOne: true,
            sql:
                'SELECT COUNT(*) FROM table WHERE department = $department AND username = $username;',
        });
    });
});
