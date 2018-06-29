import { Config, Query, StringMap } from '../../Configuration';
import { whereQuery } from '../../helpers/WhereQuery';

interface Count extends Config {
    permanentFilters?: StringMap;
}

interface CountParameters {
    filters?: StringMap;
}

export const count = ({ table, permanentFilters = {} }: Count) => ({
    filters,
}: CountParameters = {}): Query => {
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
