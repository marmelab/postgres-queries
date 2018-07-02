import { AnyMap, Config, Query, StringMap } from '../../Configuration';
import { whereQuery } from '../../helpers/WhereQuery';

interface Count extends Config {
    permanentFilters?: StringMap;
}

interface Filters {
    filters?: AnyMap;
}

type QueryFunction = (filters?: Filters) => Query;

export const count = ({ table, permanentFilters = {} }: Count) => ({
    filters,
}: Filters = {}): Query => {
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

    const where = whereQuery(mergedFilters, identifiers);
    const sql = `SELECT COUNT(*) FROM ${table} ${where};`;

    return { sql, parameters: mergedFilters, returnOne: true };
};