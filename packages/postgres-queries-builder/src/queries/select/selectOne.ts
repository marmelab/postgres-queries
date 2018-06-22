import Config, { QueryFun, StringMap } from '../../configuration';
import sanitizeIdentifier from '../../helpers/sanitizeIdentifier';
import whereQuery from '../../helpers/whereQuery';

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
