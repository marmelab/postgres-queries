import { Config, StringMap } from '../../Configuration';
import { returningQuery } from '../../helpers/ReturningQuery';
import { sanitizeIdentifier } from '../../helpers/SanitizeIdentifier';
import { sanitizeParameter } from '../../helpers/SanitizeParameter';
import { whereQuery } from '../../helpers/WhereQuery';

interface Remove extends Config {
    filterCols: string[];
    returnCols: string[];
    permanentFilters?: StringMap;
}

export const remove = (
    { table, filterCols, returnCols, permanentFilters = {} }: Remove,
    returnOne = false,
) => {
    const returning = returningQuery(returnCols);

    return ids => {
        const finalFilterCols = [
            ...filterCols,
            ...Object.keys(permanentFilters),
        ];

        const finalIdentifiers = {
            ...ids,
            ...permanentFilters,
        };

        const parameters = returnOne
            ? sanitizeIdentifier(finalFilterCols, finalIdentifiers)
            : sanitizeParameter(finalFilterCols, finalIdentifiers);

        const where = whereQuery(parameters, finalFilterCols);
        const sql = `DELETE FROM ${table} ${where} ${returning}`;

        return {
            parameters,
            returnOne,
            sql,
        };
    };
};
