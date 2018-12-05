import * as pg from 'pg';
import * as signale from 'signale';
import { namedToNumericParameter } from './helpers';

import namedQueryFromPoolClient from './namedQuery';

export { namedQueryFromPoolClient };

function setupClient(client: pg.PoolClient) {
    const namedQuery = namedQueryFromPoolClient(client);

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

export default (
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
