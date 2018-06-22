import { Config, Query, StringMap } from '../../Configuration';
import { whereQuery } from '../../helpers/WhereQuery';

interface CountAll extends Config {
    permanentFilters?: StringMap;
}

export const countAll = ({
    table,
    permanentFilters = {},
}: CountAll) => (): Query => {
    const identifiers = Object.keys(permanentFilters);
    if (!identifiers.length) {
        return {
            returnOne: true,
            sql: `SELECT COUNT(*) FROM ${table};`,
        };
    }

    const where = whereQuery(permanentFilters, identifiers);
    const sql = `SELECT COUNT(*) FROM ${table} ${where};`;

    return { sql, parameters: permanentFilters, returnOne: true };
};
