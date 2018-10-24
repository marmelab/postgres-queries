import * as signale from 'signale';

import { AnyMap, Config, Query, StringMap } from '../../Configuration';
import { returningQuery } from '../../helpers/ReturningQuery';
import { sanitizeIdentifier } from '../../helpers/SanitizeIdentifier';
import { sanitizeParameter } from '../../helpers/SanitizeParameter';
import { whereQuery } from '../../helpers/WhereQuery';
import { addSuffix } from '../../utils/AddSuffix';

interface Update extends Config {
    writableCols: string[];
    filterCols: string[];
    returnCols?: string | string[];
    permanentFilters?: StringMap;
}

type QueryFunction = (filters: any, data: AnyMap) => Query;

export const update = (
    {
        table,
        writableCols,
        filterCols: selectors,
        returnCols,
        permanentFilters = {},
    }: Update,
    returnOne = false,
): QueryFunction => {
    const filterCols = [
        ...(Array.isArray(selectors) ? selectors : [selectors]),
        ...Object.keys(permanentFilters),
    ];

    const returning = returningQuery(returnCols);

    return (filter, data) => {
        // with updateOne query builder the primaryKey is add to the first entry of the filterCols
        const upgradedFilters = {
            ...(typeof filter === 'object'
                ? filter
                : { [selectors[0]]: filter }),
            ...permanentFilters,
        };
        const filters = returnOne
            ? sanitizeIdentifier(filterCols, upgradedFilters)
            : sanitizeParameter(filterCols, upgradedFilters);
        const updateParameters = sanitizeParameter(writableCols, data);
        const parameters = {
            ...filters,
            ...addSuffix(updateParameters, '_u'),
        };

        const { value: where, log } = whereQuery(filters, filterCols).read();
        log.map(signale.debug);

        const setQuery = writableCols
            .filter(column => typeof updateParameters[column] !== 'undefined')
            .reduce(
                (result, column) => [...result, `${column}=$${column}_u`],
                [],
            );

        if (Object.keys(parameters).length === 1) {
            throw new Error('no valid column to set');
        }

        const sql = `UPDATE ${table}
SET ${setQuery.join(', ')}
${where}
${returning}`;

        return {
            parameters,
            returnOne,
            sql,
        };
    };
};
