import { AnyMap, Config, Query } from '../../Configuration';
import { returningQuery } from '../../helpers/ReturningQuery';
import { sanitizeParameter } from '../../helpers/SanitizeParameter';
import { valueSubQuery } from '../../helpers/ValueSubQuery';

interface InsertOne extends Config {
    writableCols: string[];
    returnCols?: string | string[];
}

type QueryFunction = (data: AnyMap) => Query;

export const insertOne = ({
    table,
    writableCols,
    returnCols,
}: InsertOne): QueryFunction => {
    const returning = returningQuery(returnCols);

    return data => {
        const parameters = sanitizeParameter(writableCols, data);
        const keys = Object.keys(parameters);
        const values = valueSubQuery(keys, '');
        const sql = `INSERT INTO ${table}
(${keys.join(', ')})
VALUES(${values})
${returning}`;

        return {
            parameters,
            returnOne: true,
            sql,
        };
    };
};
