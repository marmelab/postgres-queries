import * as signale from 'signale';

import { AnyMap, Config, Query, SortDir, StringMap } from '../../Configuration';
import { sanitizeParameter } from '../../helpers/SanitizeParameter';
import { whereQuery } from '../../helpers/WhereQuery';
import { flatten } from '../../utils/Flatten';

interface Select extends Config {
    primaryKey: string | string[];
    returnCols: string[];
    searchableCols?: string[];
    specificSorts?: AnyMap;
    groupByCols?: string[];
    withQuery?: boolean;
    permanentFilters?: StringMap;
    returnOne?: boolean;
}

export interface SelectFilters {
    limit?: number;
    offset?: number;
    filters?: AnyMap;
    sort?: string;
    sortDir?: SortDir;
}

type QueryFunction = (filters?: SelectFilters) => Query;

export const select = ({
    table,
    primaryKey: ids = 'id',
    returnCols,
    searchableCols = returnCols || [],
    specificSorts = {},
    groupByCols = [],
    withQuery = table.indexOf('JOIN') !== -1,
    permanentFilters = {},
    returnOne,
}: Select): QueryFunction => {
    const primaryKey = [].concat(ids);
    const selectedCol = returnCols.length ? returnCols.join(', ') : '*';

    return (
        { limit, offset, filters = {}, sort, sortDir } = { filters: {} },
    ) => {
        const finalFilters = {
            ...filters,
            ...permanentFilters,
        };
        const finalSearchableCols = [
            ...searchableCols,
            ...Object.keys(permanentFilters),
        ];

        const { value: where, log } = whereQuery(
            finalFilters,
            finalSearchableCols,
        ).read();
        log.map(signale.warn);

        let sql = `SELECT ${selectedCol} FROM ${table} ${where}`;

        if (groupByCols.length > 0) {
            sql = `${sql} GROUP BY ${groupByCols.join(', ')}`;
        }
        // withQuery add a temporary result table that allows to filters on computed and joined column
        if (withQuery) {
            sql = `WITH result AS (
${sql.trim()}
) SELECT * FROM result`;
        }

        const parameters = flatten(
            sanitizeParameter(finalSearchableCols, finalFilters),
        );

        // always sort by ids to avoid randomness in case of identical sort column value
        const sortQuery = [primaryKey.map(idCol => `${idCol} ASC`).join(', ')];
        if (sort) {
            const normalizedSort = sort.toLowerCase();
            if (specificSorts && specificSorts.hasOwnProperty(normalizedSort)) {
                const specificSort = specificSorts[normalizedSort].reduce(
                    (result, condition, index) =>
                        `${result} WHEN '${condition}' THEN ${index + 1}`,
                    `CASE ${normalizedSort}`,
                );
                sortQuery.unshift(
                    `${specificSort} END ${
                        sortDir.toLowerCase() === 'asc' ? ' ASC' : ' DESC'
                    }`,
                );
            } else if (returnCols.indexOf(normalizedSort) !== -1) {
                sortQuery.unshift(
                    `${normalizedSort} ${
                        sortDir.toLowerCase() === 'asc' ? 'ASC' : 'DESC'
                    }`,
                );
            }
        }
        sql = `${sql} ORDER BY ${sortQuery.join(', ')}`;

        if (limit) {
            sql = `${sql} LIMIT $limit OFFSET $offset`;
            parameters.limit = limit || 30;
            parameters.offset = offset || 0;
        }

        return { sql, parameters, returnOne };
    };
};
