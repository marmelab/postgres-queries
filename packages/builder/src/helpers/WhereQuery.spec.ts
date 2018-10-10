import {
    getColPlaceHolder,
    getColType,
    getFrom,
    getLike,
    getMatch,
    getNot,
    getNotLike,
    getQuery,
    getTo,
    sortQueryType,
    whereQuery,
} from './WhereQuery';

describe('whereQuery', () => {
    it('should return whereQuery', () => {
        expect(
            whereQuery(
                {
                    column1: 1,
                    column4: ['some value', 'other value'],
                    column8: 'ignored',
                    from_column3: new Date(800),
                    like_column5: 'contain',
                    match: '%6%',
                    not_column7: 'different',
                    not_like_column9: 'not contain',
                    'table.column6': 'complex',
                    to_column2: new Date(500),
                },
                [
                    'column1',
                    'column2',
                    'column3',
                    'column4',
                    'column5',
                    'table.column6',
                    'column7',
                    'column9',
                ],
            ),
        ).toEqual(
            [
                'WHERE column1 = $column1',
                'AND column4 IN ($column41, $column42)',
                'AND column3::timestamp >= $from_column3::timestamp',
                'AND column5::text ILIKE $like_column5',
                'AND (column1::text ILIKE $match',
                    'OR column2::text ILIKE $match',
                    'OR column3::text ILIKE $match',
                    'OR column4::text ILIKE $match',
                    'OR column5::text ILIKE $match',
                    'OR table.column6::text ILIKE $match',
                    'OR column7::text ILIKE $match',
                    'OR column9::text ILIKE $match)',
                'AND column7 != $not_column7',
                'AND column9::text NOT ILIKE $not_like_column9',
                'AND table.column6 = $table__column6',
                'AND column2::timestamp <= $to_column2::timestamp',
            ].join(' '),
        );
    });

    describe('getColPlaceHolder', () => {
        it('should return value if value is IS_NULL or IS_NOT_NULL', () => {
            expect(getColPlaceHolder('colName', 'IS_NULL')).toEqual('IS_NULL');
            expect(getColPlaceHolder('colName', 'IS NULL')).toEqual('IS NULL');
            expect(getColPlaceHolder('colName', 'IS_NOT_NULL')).toEqual(
                'IS_NOT_NULL',
            );
            expect(getColPlaceHolder('colName', 'IS NOT NULL')).toEqual(
                'IS NOT NULL',
            );
        });

        it('should return IS NULL if value is null', () => {
            expect(getColPlaceHolder('colName', null)).toEqual('IS NULL');
        });

        it('should return IS NOT NULL if value is null and not is true', () => {
            expect(getColPlaceHolder('colName', null, true)).toEqual(
                'IS NOT NULL',
            );
        });

        it('should return IN query if value is an array', () => {
            expect(
                getColPlaceHolder('colName', ['some value', 'other value']),
            ).toEqual('IN ($colName1, $colName2)');
        });

        it('should return NOT IN query if value is an array and not is true', () => {
            expect(
                getColPlaceHolder(
                    'colName',
                    ['some value', 'other value'],
                    true,
                ),
            ).toEqual('NOT IN ($colName1, $colName2)');
        });

        it('should return != $colName if not is true', () => {
            expect(getColPlaceHolder('colName', 'some value', true)).toEqual(
                '!= $colName',
            );
        });

        it('should return = $colName otherwise', () => {
            expect(getColPlaceHolder('colName', 'some value')).toEqual(
                '= $colName',
            );
        });
    });

    describe('getColType', () => {
        it('should return query, if column is in searchableCol', () => {
            expect(getColType('col', ['col'])).toEqual({
                value: 'query',
                log: [],
            });
        });

        it('should return match, if col is match and searchableCols contain at least one element', () => {
            expect(getColType('match', ['col'])).toEqual({
                value: 'match',
                log: [],
            });
        });

        it('should return discarded if col is match but searchableCols is empty', () => {
            expect(getColType('match', [])).toEqual({
                value: 'discarded',
                log: ['There are no allowed columns to be searched, all filters will be ignored'],
            });
        });

        it('should return discarded if col is not in searchableCols', () => {
            expect(getColType('needle', ['haystack'])).toEqual({
                value: 'discarded',
                log: ['Ignoring column: needle. Allowed columns: haystack'],
            });
        });

        it('should return to if column is suffixed by to and is in searchableCols', () => {
            expect(getColType('to_column', ['column'])).toEqual({
                value: 'to',
                log: [],
            });
        });

        it('should return discarded if column is suffixed by to but is not in searchableCols', () => {
            expect(getColType('to_column', ['other_column'])).toEqual({
                value: 'discarded',
                log: ['Ignoring column: to_column. Allowed columns: other_column'],
            });
        });

        it('should return from if column is suffixed by from and is in searchableCols', () => {
            expect(getColType('from_column', ['column'])).toEqual({
                value: 'from', log: [] });
        });

        it('should return discarded if column is suffixed by from but is not in searchableCols', () => {
            expect(getColType('from_column', ['other_column'])).toEqual({
                value: 'discarded',
                log: ['Ignoring column: from_column. Allowed columns: other_column'],
            });
        });

        it('should return like if column is suffixed by like and is in searchableCols', () => {
            expect(getColType('like_column', ['column'])).toEqual({
                value: 'like',
                log: [],
            });
        });

        it('should return discarded if column is suffixed by like but is not in searchableCols', () => {
            expect(getColType('like_column', ['other_column'])).toEqual({
                value: 'discarded',
                log: ['Ignoring column: like_column. Allowed columns: other_column'],
            });
        });

        it('should return not like if column is suffixed by not_like and is in searchableCols', () => {
            expect(getColType('not_like_column', ['column'])).toEqual({
                value: 'notLike',
                log: [],
            });
        });

        it('should return discarded if column is suffixed by not_like but is not in searchableCols', () => {
            expect(getColType('not_like_column', ['other_column'])).toEqual({
                log: ['Ignoring column: not_like_column. Allowed columns: other_column'],
                value: 'discarded',
            });
        });
    });

    describe('sortQueryType', () => {
        it('should regroup query by their type', () => {
            expect(
                sortQueryType(
                    {
                        column1: 1,
                        column5: 6,
                        from_column3: 3,
                        like_column4: 4,
                        match: 5,
                        to_column2: 2,
                    },
                    ['column1', 'column2', 'column3', 'column4'],
                ).map(w => w.read()),
            ).toEqual([
                { log: [], value: { type: 'query', col: 'column1', value: 1 }},
                { log: ['Ignoring column: column5. Allowed columns: column1,column2,column3,column4'], value: { type: 'discarded', col: 'column5', value: 6 } },
                { log: [], value: { type: 'from', col: 'from_column3', value: 3 } },
                { log: [], value: { type: 'like', col: 'like_column4', value: 4 } },
                { log: [], value: { type: 'match', col: 'match', value: 5 } },
                { log: [], value: { type: 'to', col: 'to_column2', value: 2 } },

            ]);
        });
    });

    describe('getMatch', () => {
        it('should return query and parameter to match a given value if match filter is given', () => {
            const whereParts = getMatch('match', 'needle', ['column1', 'column2', 'column3']);

            expect(whereParts).toEqual(
                '(column1::text ILIKE $match OR column2::text ILIKE $match OR column3::text ILIKE $match)',
            );
        });

        it('should return passed result if there is no searchableCols', () => {
            const whereParts = getMatch('match', 'needle', []);

            expect(whereParts).toEqual(null);
        });
    });

    describe('getFrom', () => {
        it('should return query and parameter to test for date after column value if given column starting with from_', () => {
            const whereParts = getFrom('from_date', 'date', ['column', 'date']);

            expect(whereParts).toEqual('date::timestamp >= $from_date::timestamp');
        });

        it('should work with several column starting with from_', () => {
            const whereParts = getFrom('from_birth', 'date', ['column', 'date', 'birth']);

            expect(whereParts).toEqual(
                'birth::timestamp >= $from_birth::timestamp',
            );
        });
    });

    describe('getTo', () => {
        it('should return query and parameter to test for date after column value if given column starting with to_', () => {
            const whereParts = getTo('to_date', 'date', ['column', 'date']);

            expect(whereParts).toEqual(
                'date::timestamp <= $to_date::timestamp',
            );
        });

        it('should work with several column starting with to_', () => {
            const whereParts = getTo('to_birth', 'date', ['column', 'date', 'birth']);

            expect(whereParts).toEqual(
                'birth::timestamp <= $to_birth::timestamp',
            );
        });
    });

    describe('getLike', () => {
        it('should return query and parameter to test column like value if given column starting with like_', () => {
            const whereParts = getLike('like_column', 'pattern', ['column']);

            expect(whereParts).toEqual('column::text ILIKE $like_column');
        });
    });

    describe('getNotLike', () => {
        it('should return query and parameter to test column not like value if given column starting with not_like_', () => {
            const whereParts = getNotLike('not_like_column', 'pattern', ['column']);

            expect(whereParts).toEqual(
                'column::text NOT ILIKE $not_like_column',
            );
        });
    });

    describe('getNot', () => {
        it('should return query and parameter to test column not equal to value if given column starting with not_', () => {
            const whereParts = getNot('not_column', 'not me', ['column']);

            expect(whereParts).toEqual('column != $not_column');
        });
    });

    describe('getQuery', () => {
        it('should return query and parameter for parameter in searchableCols', () => {
            const whereParts = getQuery('column', 'value',
                ['column', 'column2', 'column3'],
            );

            expect(whereParts).toEqual('column = $column');
        });

        it('should return replace "." in column name by "__" for parameter name', () => {
            const whereParts = getQuery('table.column': 'value', ['table.column1', 'table.column2', 'table.column3']);

            expect(whereParts).toEqual('table.column = $table__column');
        });
    });
});
