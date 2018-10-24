import * as signale from 'signale';

import { Config, filters, Query } from '../../Configuration';
import { sanitizeIdentifier } from '../../helpers/SanitizeIdentifier';
import { whereQuery } from '../../helpers/WhereQuery';

interface SelectOne extends Config {
    primaryKey: string | string[];
    returnCols: string[];
    permanentFilters?: filters;
}

type QueryFunction = (raw: filters | string) => Query;

export const selectOne = ({
    table,
    primaryKey = 'id',
    returnCols = ['*'],
    permanentFilters = {},
}: SelectOne): QueryFunction => {
    const select = returnCols.join(', ');

    const identifiers = [
        ...(Array.isArray(primaryKey) ? primaryKey : [primaryKey]),
        ...Object.keys(permanentFilters),
    ];

    return rawParameters => {
        const parameters = sanitizeIdentifier(identifiers, {
            ...(typeof rawParameters === 'object'
                ? rawParameters
                : {
                      [Array.isArray(primaryKey)
                          ? primaryKey[0]
                          : primaryKey]: rawParameters,
                  }),
            ...permanentFilters,
        });

        const { value: where, log } = whereQuery(
            parameters,
            identifiers,
        ).read();
        log.map(signale.warn);
        const sql = `SELECT ${select} FROM ${table} ${where} LIMIT 1`;

        return { sql, parameters, returnOne: true };
    };
};
