import * as signale from 'signale';

import {
    Config,
    filters as filtersType,
    Literal,
    Query,
} from '../../Configuration';
import { whereQuery } from '../../helpers/WhereQuery';

interface Count extends Config {
    permanentFilters?: filtersType;
}

export interface CountAllFilters {
    filters?: Literal<any>;
}

export const count = ({ table, permanentFilters = {} }: Count) => ({
    filters,
}: CountAllFilters = {}): Query => {
    const mergedFilters = {
        ...permanentFilters,
        ...filters,
    };

    const identifiers = Object.keys(mergedFilters);
    if (!identifiers.length) {
        return {
            returnOne: true,
            sql: `SELECT COUNT(*) FROM ${table};`,
        };
    }

    const { value: where, log } = whereQuery(mergedFilters, identifiers).read();
    log.map(signale.warn);
    const sql = `SELECT COUNT(*) FROM ${table} ${where};`;

    return { sql, parameters: mergedFilters, returnOne: true };
};
