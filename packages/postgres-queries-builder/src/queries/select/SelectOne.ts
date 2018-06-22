import { Config, QueryFun, StringMap } from '../../Configuration';
import { sanitizeIdentifier } from '../../helpers/SanitizeIdentifier';
import { whereQuery } from '../../helpers/WhereQuery';

interface SelectOne extends Config {
    primaryKey: string | string[];
    returnCols: string[];
    permanentFilters?: StringMap;
}

export const selectOne = ({
    table,
    primaryKey = 'id',
    returnCols = ['*'],
    permanentFilters = {},
}: SelectOne): QueryFun => {
    const select = returnCols.join(', ');

    const identifiers = [
        ...[].concat(primaryKey),
        ...Object.keys(permanentFilters),
    ];

    return rawParameters => {
        const parameters = sanitizeIdentifier(identifiers, {
            ...(typeof rawParameters === 'object'
                ? rawParameters
                : { [primaryKey]: rawParameters }),
            ...permanentFilters,
        });

        const where = whereQuery(parameters, identifiers);
        const sql = `SELECT ${select} FROM ${table} ${where} LIMIT 1`;

        return { sql, parameters, returnOne: true };
    };
};
