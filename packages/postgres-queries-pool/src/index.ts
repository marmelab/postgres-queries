import * as pg from 'pg';
import * as signale from 'signale';
import { namedToNumericParameter } from './helpers';

type QueryWithNamedParameters = (
    queryTextOrConfig: string | pg.QueryConfig,
    values?: any[],
    returnOne?: boolean,
) => Promise<pg.QueryResult>;

function setupClient(client: pg.PoolClient) {
    const query: QueryWithNamedParameters = async (
        named,
        parameters = named.parameters,
        returnOne = named.returnOne,
    ) => {
        const sql = typeof named === 'object' ? named.sql : named;

        if (sql === null) {
            throw new Error('sql cannot be null');
        }

        if (sql === '') {
            return returnOne ? null : [];
        }

        const {
            sql: parsedSql,
            parameters: parsedParameters,
        } = namedToNumericParameter(sql, parameters);

        const result = await client
            .query(parsedSql, parsedParameters)
            .then(queryResult => queryResult.rows);
        if (returnOne && result.length > 1) {
            signale.warn(
                `Query supposed to return only one result but got ${
                    result.length
                }`,
            );
        }

        return returnOne ? result[0] : result;
    };

    const linkOne = (querier: any) => (args: Iterable<object>) =>
        query(querier(...args));

    const link = querier => {
        if (typeof querier === 'function') {
            return linkOne(querier);
        }

        return Object.keys(querier).reduce(
            (result, key) => ({
                ...result,
                [key]: linkOne(querier[key]), // Missing second argument key
            }),
            {},
        );
    };

    return {
        ...client,
        query,
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
