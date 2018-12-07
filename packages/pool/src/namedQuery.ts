import { PoolClient } from 'pg';
import * as signale from 'signale';

import { namedToNumericParameter } from './helpers';

export interface QueryData {
    sql: string;
    parameters: object;
    returnOne: boolean;
}

type QueryWithNamedParameters = (queryData: QueryData) => Promise<any[] | null>;

const namedQueryFactory = (client: PoolClient) => {
    const namedQuery: QueryWithNamedParameters = async queryData => {
        if (queryData.sql === null) {
            throw new Error('sql cannot be null');
        }

        if (queryData.sql === '') {
            return queryData.returnOne ? null : [];
        }

        const {
            sql: parsedSql,
            parameters: parsedParameters,
        } = namedToNumericParameter(queryData.sql, queryData.parameters);

        const result = await client
            .query(parsedSql, parsedParameters)
            .then(queryResult => queryResult.rows);

        if (queryData.returnOne && result.length > 1) {
            signale.warn(
                `Query supposed to return only one result but got ${
                    result.length
                }`,
            );
        }

        return queryData.returnOne ? result[0] : result;
    };

    return namedQuery;
};

export default namedQueryFactory;
