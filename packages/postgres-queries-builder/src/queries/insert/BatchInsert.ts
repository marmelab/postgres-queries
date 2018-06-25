import { AnyMap, Config, Query, StringMap } from '../../Configuration';
import { batchParameter } from '../../helpers/BatchParameter';
import { returningQuery } from '../../helpers/ReturningQuery';
import { valueSubQuery } from '../../helpers/ValueSubQuery';

interface BatchInsert extends Config {
    writableCols: string[];
    returnCols?: string[];
}

type QueryFun = (rows: AnyMap[]) => Query;

export const batchInsert = ({
    table,
    writableCols,
    returnCols,
}: BatchInsert): QueryFun => {
    const returning = returningQuery(returnCols);

    return rows => {
        if (!rows || rows.length === 0) {
            return { sql: '' };
        }

        const parameters = batchParameter(writableCols)(rows);
        const getValueSubQuery = valueSubQuery(writableCols);

        const values = rows
            .map((row, index) => getValueSubQuery(index + 1))
            .reduce((result, sqlString) => result.concat(`(${sqlString})`), [])
            .join(', ');

        const sql = `INSERT INTO ${table}(${writableCols.join(
            ', ',
        )}) VALUES ${values} ${returning};`;

        return { sql, parameters };
    };
};
