import * as signale from 'signale';

import { Literal } from '../Configuration';
import List from '../utils/List';
import Writer from '../utils/Writer';

export const getColPlaceHolder = (
    column: string,
    value: any,
    not: boolean | null = false,
) => {
    const normalizedColumn = column.replace('.', '__');
    const type = Array.isArray(value) ? 'IN' : value;
    switch (type) {
        case null:
            return Writer.of(`IS ${not ? 'NOT ' : ''}NULL`);
        case 'IS_NULL':
        case 'IS NULL':
        case 'IS_NOT_NULL':
        case 'IS NOT NULL':
            return new Writer(value, [
                {
                    type: 'warn',
                    message:
                        'Passing `IS (NOT) NULL` to filter value is deprecated, please pass null directly with not_ prefix if needed',
                },
            ]);
        case 'IN':
            return Writer.of(
                `${not ? 'NOT ' : ''}IN (${value
                    .map(
                        (_: any, index: number) =>
                            `$${normalizedColumn}${index + 1}`,
                    )
                    .join(', ')})`,
            );
        default:
            return Writer.of(`${not ? '!=' : '='} $${normalizedColumn}`);
    }
};

export const getColType = (column: string, searchableCols: string[]) => {
    if (!searchableCols.length) {
        return new Writer('discarded', [
            {
                type: 'no searchable',
                message:
                    'There are no allowed columns, all columns will be ignored',
            },
        ]);
    }
    if (column === 'match' && searchableCols.length > 0) {
        return Writer.of('match');
    }
    if (searchableCols.indexOf(column) !== -1) {
        return Writer.of('query');
    }
    if (
        column.indexOf('not_') === 0 &&
        searchableCols.indexOf(column.replace('not_', '')) !== -1
    ) {
        return Writer.of('not');
    }
    if (
        column.indexOf('from_') === 0 &&
        searchableCols.indexOf(column.replace('from_', '')) !== -1
    ) {
        return Writer.of('from');
    }
    if (
        column.indexOf('to_') === 0 &&
        searchableCols.indexOf(column.replace('to_', '')) !== -1
    ) {
        return Writer.of('to');
    }
    if (
        column.indexOf('like_') === 0 &&
        searchableCols.indexOf(column.replace('like_', '')) !== -1
    ) {
        return Writer.of('like');
    }
    if (
        column.indexOf('not_like_') === 0 &&
        searchableCols.indexOf(column.replace('not_like_', '')) !== -1
    ) {
        return Writer.of('notLike');
    }

    return new Writer('discarded', [{ type: 'ignoring', message: column }]);
};

export const sortQueryType = (
    filters: Literal<any>,
    searchableCols: string[],
) => {
    return new List(Object.keys(filters)).map(col => {
        const typeWriter = getColType(col, searchableCols);

        return typeWriter.map(type => ({
            type,
            col,
            value: filters[col],
        }));
    });
};

export const getMatch = (col: string, value: any, searchableCols: string[]) => {
    return !searchableCols.length
        ? null
        : `(${searchableCols
              .map(searchableCol => `${searchableCol}::text ILIKE $match`)
              .join(' OR ')})`;
};

export const getLike = (col: string, value: any, searchableCols: string[]) => {
    return `${col.replace('like_', '')}::text ILIKE $${col.replace('.', '__')}`;
};

export const getNotLike = (
    col: string,
    value: any,
    searchableCols: string[],
) => {
    return `${col.replace('not_like_', '')}::text NOT ILIKE $${col.replace(
        '.',
        '__',
    )}`;
};

export const getFrom = (col: string, value: any, searchableCols: string[]) => {
    return `${col.replace('from_', '')}::timestamp >= $${col.replace(
        '.',
        '__',
    )}::timestamp`;
};

export const getTo = (col: string, value: any, searchableCols: string[]) => {
    return `${col.replace('to_', '')}::timestamp <= $${col.replace(
        '.',
        '__',
    )}::timestamp`;
};

export const getNot = (
    col: string,
    value: any,
    searchableCols: string[],
): Writer<string> => {
    return getColPlaceHolder(col, value, true).map(
        v => `${col.replace('not_', '')} ${v}`,
    );
};
export const getQuery = (col: string, value: any, searchableCols: string[]) => {
    return getColPlaceHolder(col, value, false).map(v => `${col} ${v}`);
};

export const getResult = (whereParts = []) => {
    return whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
};

type getPartFn = (
    col: string,
    value: any,
    searchableCols: string[],
) => Writer<string>;

interface WherePartsBuilder {
    match: getPartFn;
    from: getPartFn;
    to: getPartFn;
    like: getPartFn;
    notLike: getPartFn;
    not: getPartFn;
    query: getPartFn;
    [key: string]: getPartFn;
}

const wherePartsBuilder: WherePartsBuilder = {
    match: Writer.lift(getMatch),
    from: Writer.lift(getFrom),
    to: Writer.lift(getTo),
    like: Writer.lift(getLike),
    notLike: Writer.lift(getNotLike),
    not: getNot,
    query: getQuery,
};

type logType = 'warn' | 'ignoring' | 'no searchable';

interface Log {
    type: logType;
    message: string;
}

export const whereQuery = (filters: Literal<any>, searchableCols: string[]) => {
    if (!searchableCols.length) {
        return new Writer('', [
            {
                type: 'no searchable',
                message:
                    'There are no allowed columns, all columns will be ignored',
            },
        ]);
    }
    const filtersByType = sortQueryType(filters, searchableCols);

    const { log, value: whereParts } = filtersByType
        .map(writer =>
            writer.chain(({ type, col, value }) => {
                const getPart = wherePartsBuilder[type];

                return getPart
                    ? getPart(col, value, searchableCols)
                    : Writer.of(undefined);
            }),
        )
        .sequence(Writer.of) // convert List([Writer(value), Writer(value)]) to Writer(List([value, value]))
        .read(); // And now read get executed for all value in the List merging all log and all values. It's mathemagic!

    const ignoredColumns = log.filter(({ type }: Log) => type === 'ignoring');

    log.filter(({ type }: Log) => type === 'warn').map(({ message }: Log) =>
        signale.warn(message),
    );

    return new Writer(
        getResult(whereParts.toArray().filter((v: string) => v)),
        [
            ignoredColumns.length && {
                type: 'ignoring',
                message: `Ignoring columns: [${ignoredColumns
                    .map(({ message }: Log) => message)
                    .join(', ')}]. Allowed columns: [${searchableCols.join(
                    ', ',
                )}]`,
            },
            log.find(({ type }: Log) => type === 'no searchable'),
        ].filter(v => v),
    );
};
