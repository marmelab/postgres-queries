import { Config, Query, StringMap } from '../../Configuration';
import { batchParameter } from '../../helpers/BatchParameter';
import { valueSubQuery } from '../../helpers/ValueSubQuery';
import { whereQuery } from '../../helpers/WhereQuery';

interface BatchUpsert extends Config {
    primaryKey: string[];
    writableCols: string[];
    returnCols?: string[];
    permanentFilters?: StringMap;
}

type QueryFunction = (rows: any[]) => Query;

export const BatchUpsert = ({
    table,
    primaryKey,
    writableCols,
    returnCols = ['*'],
    permanentFilters = {},
}: BatchUpsert): QueryFunction => rows => {
    const columns = primaryKey.concat(
        writableCols.filter(f => primaryKey.indexOf(f) === -1),
    );

    const getValueSubQuery = valueSubQuery(columns);
    const getParameter = batchParameter(columns);

    const returning = returnCols.join(', ');

    const setQuery = writableCols.map(col => `${col} = excluded.${col}`);

    const values = rows
        .map((_, index) => getValueSubQuery(index + 1))
        .reduce((result, value) => result.concat(`(${value})`), []);

    const parameters = getParameter(rows);

    const permanentFiltersKeys = Object.keys(permanentFilters);
    const where = permanentFiltersKeys.length
        ? whereQuery(permanentFilters, permanentFiltersKeys)
        : '';

    const sql = `INSERT INTO ${table}
(${columns.join(', ')})
VALUES ${values.join(', ')}
ON CONFLICT (${primaryKey.join(', ')})
DO UPDATE SET ${setQuery.join(', ')} ${where}
RETURNING ${returning}`;

    return {
        parameters: {
            ...parameters,
            ...permanentFilters,
        },
        sql,
    };
};
