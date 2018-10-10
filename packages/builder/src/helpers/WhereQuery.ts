import * as signale from 'signale';
import Reader from '../utils/Reader';

export const getColPlaceHolder = (column, value, not) => {
    const normalizedColumn = column.replace('.', '__');
    const type = Array.isArray(value) ? 'IN' : value;
    switch (type) {
        case null:
            return `IS ${not ? 'NOT ' : ''}NULL`;
        case 'IS_NULL':
        case 'IS NULL':
        case 'IS_NOT_NULL':
        case 'IS NOT NULL':
            signale.warn(
                'Passing `IS (NOT) NULL` to filter value is deprecated, please pass null directly with not_ prefix if needed',
            );
            return value;
        case 'IN':
            return `${not ? 'NOT ' : ''}IN (${value
                .map((_, index) => `$${normalizedColumn}${index + 1}`)
                .join(', ')})`;
        default:
            return `${not ? '!=' : '='} $${normalizedColumn}`;
    }
};

export const getColType = (column, searchableCols) => {
    if (!searchableCols.length) {
        signale.warn(
            'There are no allowed columns to be searched, all filters will be ignored',
        );
        return 'discarded';
    }
    if (column === 'match' && searchableCols.length > 0) {
        return 'match';
    }
    if (searchableCols.indexOf(column) !== -1) {
        return 'query';
    }
    if (
        column.indexOf('not_') === 0 &&
        searchableCols.indexOf(column.substr(4)) !== -1
    ) {
        return 'not';
    }
    if (
        column.indexOf('from_') === 0 &&
        searchableCols.indexOf(column.substr(5)) !== -1
    ) {
        return 'from';
    }
    if (
        column.indexOf('to_') === 0 &&
        searchableCols.indexOf(column.substr(3)) !== -1
    ) {
        return 'to';
    }
    if (
        column.indexOf('like_') === 0 &&
        searchableCols.indexOf(column.substr(5)) !== -1
    ) {
        return 'like';
    }
    if (
        column.indexOf('not_like_') === 0 &&
        searchableCols.indexOf(column.substr(9)) !== -1
    ) {
        return 'notLike';
    }

    signale.warn(
        `Ignoring filter: ${column}. Allowed columns: ${searchableCols}`,
    );

    return 'discarded';
};

export const sortQueryType = (filters, searchableCols) => {
    return Object.keys(filters).reduce(
        (result, col) => {
            const colType = getColType(col, searchableCols);

            return {
                ...result,
                [colType]: { ...result[colType], [col]: filters[col] },
            };
        },
        { match: {}, from: {}, to: {}, query: {}, like: {}, notLike: {}, not: {} },
    );
};

export const getMatch = (filters, searchableCols) => {
    return !searchableCols.length
        ? []
        : Object.keys(filters).reduce(
              result => [
                  ...result,
                  `(${searchableCols
                      .map(
                          searchableCol =>
                              `${searchableCol}::text ILIKE $match`,
                      )
                      .join(' OR ')})`,
              ],
              [],
          );
};

export const getLike = (filters, searchableCols) => {
    return Object.keys(filters).reduce(
        (result, column) => [
            ...result,
            `${column.substr(5)}::text ILIKE $${column.replace('.', '__')}`,
        ],
        [],
    );
};

export const getNotLike = (filters, searchableCols) => {
    return Object.keys(filters).reduce(
        (result, column) => [
            ...result,
            `${column.substr(9)}::text NOT ILIKE $${column.replace('.', '__')}`,
        ],
        [],
    );
};

export const getFrom = (filters, searchableCols) => {
    return Object.keys(filters).reduce(
        (result, column) => [
            ...result,
            `${column.substr(5)}::timestamp >= $${column.replace(
                '.',
                '__',
            )}::timestamp`,
        ],
        [],
    );
};

export const getTo = (filters, searchableCols) => {
    return Object.keys(filters).reduce(
        (result, column) => [
            ...result,
            `${column.substr(3)}::timestamp <= $${column.replace(
                '.',
                '__',
            )}::timestamp`,
        ],
        [],
    );
};

export const getNot = (filters, searchableCols) => {
    return Object.keys(filters).reduce(
        (result, column) => [
            ...result,
            `${column.substr(4)} ${getColPlaceHolder(
                column,
                filters[column],
                true,
            )}`,
        ],
        [],
    );
};

export const getQuery = (filters, searchableCols, whereParts = []) => {
    return Object.keys(filters).reduce(
        (result, column) => [
            ...result,
            `${column} ${getColPlaceHolder(column, filters[column], false)}`,
        ],
        whereParts,
    );
};

export const getResult = (whereParts = []) => {
    return whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
};



const getFilterFor = (key, fn) => whereParts => new Reader((context) => [...whereParts, ...fn(context[key], context.searchableCols) ]);

export const whereQuery = (filters, searchableCols) => {
    const filtersByType = sortQueryType(filters, searchableCols);

    return Reader.of([])
        .chain(getFilterFor('match', getMatch))
        .chain(getFilterFor('from', getFrom))
        .chain(getFilterFor('to', getTo))
        .chain(getFilterFor('like', getLike))
        .chain(getFilterFor('notLike', getNotLike))
        .chain(getFilterFor('not', getNot))
        .chain(getFilterFor('query', getQuery))
        .map(getResult)
        .run({ ...filtersByType, searchableCols });
};
