import * as signale from 'signale';
import Reader from '../utils/Reader';
import Writer from '../utils/Writer';

export const getColPlaceHolder = (column, value: any, not: boolean | null = false) => {
    const normalizedColumn = column.replace('.', '__');
    const type = Array.isArray(value) ? 'IN' : value;
    switch (type) {
        case null:
            return Writer.of(`IS ${not ? 'NOT ' : ''}NULL`);
        case 'IS_NULL':
        case 'IS NULL':
        case 'IS_NOT_NULL':
        case 'IS NOT NULL':
            return new Writer(value, ['Passing `IS (NOT) NULL` to filter value is deprecated, please pass null directly with not_ prefix if needed']);
        case 'IN':
            return Writer.of(`${not ? 'NOT ' : ''}IN (${value
                .map((_, index) => `$${normalizedColumn}${index + 1}`)
                .join(', ')})`);
        default:
            return Writer.of(`${not ? '!=' : '='} $${normalizedColumn}`);
    }
};

export const getColType = (column, searchableCols) => {
    if (!searchableCols.length) {
        return new Writer('discarded', ['There are no allowed columns to be searched, all filters will be ignored']);
    }
    if (column === 'match' && searchableCols.length > 0) {
        return Writer.of('match');
    }
    if (searchableCols.indexOf(column) !== -1) {
        return Writer.of('query');
    }
    if (
        column.indexOf('not_') === 0 &&
        searchableCols.indexOf(column.substr(4)) !== -1
    ) {
        return Writer.of('not');
    }
    if (
        column.indexOf('from_') === 0 &&
        searchableCols.indexOf(column.substr(5)) !== -1
    ) {
        return Writer.of('from');
    }
    if (
        column.indexOf('to_') === 0 &&
        searchableCols.indexOf(column.substr(3)) !== -1
    ) {
        return Writer.of('to');
    }
    if (
        column.indexOf('like_') === 0 &&
        searchableCols.indexOf(column.substr(5)) !== -1
    ) {
        return Writer.of('like');
    }
    if (
        column.indexOf('not_like_') === 0 &&
        searchableCols.indexOf(column.substr(9)) !== -1
    ) {
        return Writer.of('notLike');
    }

    return new Writer('discarded', [`Ignoring column: ${column}. Allowed columns: ${searchableCols}`]);
};

export const sortQueryType = (filters, searchableCols) => {
    return Object.keys(filters).map(col => {
        const typeWriter = getColType(col, searchableCols);

        return typeWriter.map(type => ({
            type,
            col,
            value: filters[col],
        }));
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
    return getColPlaceHolder(
        col,
        value,
        true,
    ).map(value => `${col.substr(4)} ${value}`);
};
export const getQuery = (col, value, searchableCols) => {
    return getColPlaceHolder(col, value, false).map(value => `${col} ${value}`);
};

export const getResult = (whereParts = []) => {
    return whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
};

const wherePartsBuilder = {
    match: Writer.lift(getMatch),
    from: Writer.lift(getFrom),
    to: Writer.lift(getTo),
    like: Writer.lift(getLike),
    notLike: Writer.lift(getNotLike),
    not: getNot,
    query: getQuery,
}

export const whereQuery = (filters, searchableCols) => {
    const filtersByType = sortQueryType(filters, searchableCols);

    const { value: whereParts, log } = filtersByType
        .map(writer => writer.chain(({ type, col, value }) => {
            const getPart = wherePartsBuilder[type];

            return getPart ? getPart(col, value, searchableCols) : Writer.of(undefined);
        }).read())
        .reduce((result, { value, log }) => ({
            value: value ? [...result.value, value] : result.value,
            log: [...result.log, ...log],
        }), { value: [], log: [] });

    log.map(signale.warn);

    return getResult(whereParts);
};
