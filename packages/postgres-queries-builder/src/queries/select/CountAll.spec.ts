import { countAll } from  './CountAll';

describe('QUERY countAll', () => {
    it('should generate sql to count all row', () => {
        const countAllQuery = countAll({ table: 'table' });

        expect(countAllQuery()).toEqual({
            sql: 'SELECT COUNT(*) FROM table;',
            returnOne: true,
        });
    });

    it('should generate sql to count all row by applying permanent filters', () => {
        const countAllQuery = countAll({
            table: 'table',
            permanentFilters: {
                column1: 'foo',
                column2: 'bar',
            },
        });

        expect(countAllQuery()).toEqual({
            sql: 'SELECT COUNT(*) FROM table WHERE column1 = $column1 AND column2 = $column2;',
            parameters: {
                column1: 'foo',
                column2: 'bar',
            },
            returnOne: true,
        });
    });
});
