import * as pg from 'pg';
import * as signale from 'signale';
import { namedToNumericParameter } from './helpers';

interface QueryData {
    sql: string;
    parameters: object;
    returnOne: boolean;
}

type QueryWithNamedParameters = (queryData: QueryData) => Promise<any[] | null>;

function setupClient(client: pg.PoolClient) {
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

    const linkOne = (querier: any) => (args: Iterable<object>) =>
        namedQuery(querier(...args));

    const link = (querier: any) => {
        if (typeof querier === 'function') {
            return linkOne(querier);
        }

        return Object.keys(querier).reduce(
            (result, key) => ({
                ...result,
                [key]: linkOne({ ...querier[key], key }),
            }),
            {},
        );
    };

    return {
        ...client,
        link,
        namedQuery,
    };
}

export const PgPool = (
    { user, password, database, host, port }: pg.ConnectionConfig,
    config: pg.PoolConfig = { max: 10, idleTimeoutMillis: 30000 },
) => {
    const pool = new pg.Pool({
        database,
        host,
        idleTimeoutMillis: config.idleTimeoutMillis,
        max: config.max,
        password,
        port,
        user,
    });

    return {
        ...pool,
        connect: () => pool.connect().then(setupClient),
    };
};
