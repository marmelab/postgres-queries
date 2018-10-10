import { select } from './Select';

describe('select', () => {
    it('should use a simple query if querying on a single table', () => {
        const { sql, parameters } = select({
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            table: 'table',
        })();

        expect(sql).toEqual(
            'SELECT column1, column2 FROM table  ORDER BY id ASC',
        );

        expect(parameters).toEqual({});
    });

    it('should add a group by clause if at least on groupByCols is given', () => {
        const { sql, parameters } = select({
            groupByCols: ['column1', 'column2'],
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            table: 'table',
        })();

        expect(sql).toEqual(
            'SELECT column1, column2 FROM table  GROUP BY column1, column2 ORDER BY id ASC',
        );

        expect(parameters).toEqual({});
    });

    it('should use a "WITH result AS" query if querying on a joined table', () => {
        const { sql, parameters } = select({
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            table: 'table1 JOIN table2 ON table1.table2_id table2.id',
        })();

        expect(sql).toEqual(
            `WITH result AS (
SELECT column1, column2 FROM table1 JOIN table2 ON table1.table2_id table2.id
) SELECT * FROM result ORDER BY id ASC`,
        );

        expect(parameters).toEqual({});
    });

    it('should use a "WITH result AS" query if enabling the withQuery extraOptions', () => {
        const { sql, parameters } = select({
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            table: 'table1 JOIN table2 ON table1.table2_id table2.id',
            withQuery: true,
        })();

        expect(sql).toEqual(
            `WITH result AS (
SELECT column1, column2 FROM table1 JOIN table2 ON table1.table2_id table2.id
) SELECT * FROM result ORDER BY id ASC`,
        );

        expect(parameters).toEqual({});
    });

    it('should use filters in WHERE query', () => {
        const { sql, parameters } = select({
            primaryKey: ['id'],
            returnCols: ['column1', 'column2', 'column3'],
            table: 'table',
        })({
            filters: {
                column1: 'value',
                column2: 'other value',
                not_like_column3: 'foo',
            },
        });

        expect(sql).toEqual(
            'SELECT column1, column2, column3 FROM table WHERE column1 = $column1 AND column2 = $column2 AND column3::text NOT ILIKE $not_like_column3 ORDER BY id ASC',
        );

        expect(parameters).toEqual({
            column1: 'value',
            column2: 'other value',
            not_like_column3: '%foo%',
        });
    });

    it('should use IN query when receiving an array of value as a filter parameter', () => {
        const { sql, parameters } = select({
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            table: 'table',
        })({ filters: { column1: ['value', 'other value'] } });

        expect(sql).toEqual(
            'SELECT column1, column2 FROM table WHERE column1 IN ($column11, $column12) ORDER BY id ASC',
        );

        expect(parameters).toEqual({
            column11: 'value',
            column12: 'other value',
        });
    });

    it('should use NOT IN query when receiving an array of value with a not_ as a filter parameter', () => {
        const { sql, parameters } = select({
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            table: 'table',
        })({ filters: { not_column1: ['value', 'other value'] } });

        expect(sql).toEqual(
            'SELECT column1, column2 FROM table WHERE column1 NOT IN ($not_column11, $not_column12) ORDER BY id ASC',
        );

        expect(parameters).toEqual({
            not_column11: 'value',
            not_column12: 'other value',
        });
    });

    it('should limit and skip if given corresponding parameter', () => {
        const { sql, parameters } = select({
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            table: 'table',
        })({ limit: 50, offset: 100 });

        expect(sql).toEqual(
            'SELECT column1, column2 FROM table  ORDER BY id ASC LIMIT $limit OFFSET $offset',
        );

        expect(parameters).toEqual({ limit: 50, offset: 100 });
    });

    it('should sort using sort and sortDir', () => {
        const { sql, parameters } = select({
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            table: 'table',
        })({ sort: 'Column2', sortDir: 'DESC' });

        expect(sql).toEqual(
            'SELECT column1, column2 FROM table  ORDER BY column2 DESC, id ASC',
        );
    });

    it('should use specificsort if it is set and used', () => {
        const { sql, parameters } = select({
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            specificSorts: { level: ['master', 'expert', 'novice'] },
            table: 'table',
        })({ sort: 'Level', sortDir: 'DESC' });

        expect(sql).toEqual(
            "SELECT column1, column2 FROM table  ORDER BY CASE level WHEN 'master' THEN 1 WHEN 'expert' THEN 2 WHEN 'novice' THEN 3 END  DESC, id ASC",
        );
    });

    it('should apply permanent filters', () => {
        const { sql, parameters } = select({
            permanentFilters: { column3: 'foo' },
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            table: 'table',
        })();

        expect(sql).toEqual(
            'SELECT column1, column2 FROM table WHERE column3 = $column3 ORDER BY id ASC',
        );

        expect(parameters).toEqual({ column3: 'foo' });
    });
});
