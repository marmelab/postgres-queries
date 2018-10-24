import { Config, filters, Query } from '../../Configuration';
import { batchParameter } from '../../helpers/BatchParameter';
import { valueSubQuery } from '../../helpers/ValueSubQuery';
import { whereQuery } from '../../helpers/WhereQuery';

interface BatchUpsert extends Config {
    primaryKey: string[];
    writableCols: string[];
    returnCols?: string[];
}

type QueryFunction = (rows: any[]) => Query;

export const BatchUpsert = ({
    table,
    primaryKey,
    writableCols,
    returnCols = ['*'],
}: BatchUpsert): QueryFunction => rows => {
    const columns = primaryKey.concat(
        writableCols.filter(f => primaryKey.indexOf(f) === -1),
    );

    const getValueSubQuery = valueSubQuery(columns);
    const getParameter = batchParameter(columns);

    const returning = returnCols.join(', ');

    const setQuery = writableCols.map(col => `${col} = EXCLUDED.${col}`);

    const values = rows
        .map((_, index) => getValueSubQuery(index + 1))
        .reduce((result, value) => result.concat(`(${value})`), []);

    const parameters = getParameter(rows);

    const sql = `INSERT INTO ${table}(${columns.join(', ')})
VALUES ${values.join(', ')}
ON CONFLICT (${primaryKey.join(', ')})
DO UPDATE SET ${setQuery.join(', ')}
RETURNING ${returning}`;

    return {
        parameters: {
            ...parameters,
        },
        sql,
    };
};
