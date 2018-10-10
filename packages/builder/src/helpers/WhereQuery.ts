import * as signale from 'signale';
import Reader from '../utils/Reader';
import Writer from '../utils/Writer';

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
    return Object.keys(filters).map(col => {
        const type = getColType(col, searchableCols);

        return {
            type,
            col,
            value: filters[col],
        };
    });
};

export const getMatch = (col, value, searchableCols) => {
    return !searchableCols.length
        ? null
        : `(${searchableCols.map(searchableCol => `${searchableCol}::text ILIKE $match`).join(' OR ')})`;
};

export const getLike = (col, value, searchableCols) => {
    return `${col.substr(5)}::text ILIKE $${col.replace('.', '__')}`;
};

export const getNotLike = (col, value, searchableCols) => {
    return `${col.substr(9)}::text NOT ILIKE $${col.replace('.', '__')}`;
};

export const getFrom = (col, value, searchableCols) => {
    return `${col.substr(5)}::timestamp >= $${col.replace(
        '.',
        '__',
    )}::timestamp`;
};

export const getTo = (col, value, searchableCols) => {
    return `${col.substr(3)}::timestamp <= $${col.replace(
        '.',
        '__',
    )}::timestamp`;
};

export const getNot = (col, value, searchableCols) => {
    return `${col.substr(4)} ${getColPlaceHolder(
        col,
        value,
        true,
    )}`;
};
export const getQuery = (col, value, searchableCols) => {
    return `${col} ${getColPlaceHolder(col, value, false)}`;
};

export const getResult = (whereParts = []) => {
    return whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
};

const wherePartsBuilder = {
    match: getMatch,
    from: getFrom,
    to: getTo,
    like: getLike,
    notLike: getNotLike,
    not: getNot,
    query: getQuery,
}

export const whereQuery = (filters, searchableCols) => {
    const filtersByType = sortQueryType(filters, searchableCols);

    const wherParts = filtersByType.map(({ type, col, value }) => {
        const getPart = wherePartsBuilder[type];

        return getPart ? getPart(col, value, searchableCols) : undefined;
    })
    .filter(v => v);

    return getResult(wherParts);
};
