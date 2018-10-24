import * as signale from 'signale';

import { Config, Query, StringMap } from '../../Configuration';
import { batchParameter } from '../../helpers/BatchParameter';
import { returningQuery } from '../../helpers/ReturningQuery';
import { sanitizeIdentifier } from '../../helpers/SanitizeIdentifier';
import { whereQuery } from '../../helpers/WhereQuery';
import { combineLiterals } from '../../utils/CombineLiterals';

interface BatchRemove extends Config {
    returnCols: string | string[];
    primaryKey: string | string[];
    permanentFilters?: StringMap;
}

type QueryFunction = (ids: Array<string | number | StringMap>) => Query;

export const batchRemove = ({
    table,
    returnCols,
    primaryKey = ['id'],
    permanentFilters = {},
}: BatchRemove): QueryFunction => {
    const returning = returningQuery(returnCols);
    const selector = Array.isArray(primaryKey) ? primaryKey : [primaryKey];
    const idSanitizer = sanitizeIdentifier(selector);

    return ids => {
        const cleanIds = ids.map(idSanitizer);
        const parameters = batchParameter(selector)(cleanIds);
        const { value: where, log } = whereQuery(
            {
                ...combineLiterals(cleanIds),
                ...permanentFilters,
            },
            [...selector, ...Object.keys(permanentFilters)],
        ).read();

        log.map(signale.debug);

        const sql = `DELETE FROM ${table} ${where} ${returning};`;

        return {
            parameters: {
                ...parameters,
                ...permanentFilters,
            },
            sql,
        };
    };
};
