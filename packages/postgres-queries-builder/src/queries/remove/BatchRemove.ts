import { Config, Query, StringMap } from '../../Configuration';
import { batchParameter } from '../../helpers/BatchParameter';
import { returningQuery } from '../../helpers/ReturningQuery';
import { sanitizeIdentifier } from '../../helpers/SanitizeIdentifier';
import { whereQuery } from '../../helpers/WhereQuery';
import { combineLiterals } from '../../utils/CombineLiterals';

interface BatchRemove extends Config {
    returnCols: string[];
    primaryKey: string | string[];
    permanentFilters?: StringMap;
}

type QueryFun = (ids: string[] | number[] | StringMap[]) => Query;

export const batchRemove = ({
    table,
    returnCols,
    primaryKey = ['id'],
    permanentFilters = {},
}: BatchRemove): QueryFun => {
    const returning = returningQuery(returnCols);
    const selector = [].concat(primaryKey);
    const idSanitizer = sanitizeIdentifier(selector);

    return ids => {
        const cleanIds = ids.map(id => idSanitizer(id));
        const parameters = batchParameter(selector)(cleanIds);

        const where = whereQuery(
            {
                ...combineLiterals(cleanIds),
                ...permanentFilters,
            },
            [...selector, ...Object.keys(permanentFilters)],
        );

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
