import { Config, filters, Literal, Query } from '../../Configuration';
import { returningQuery } from '../../helpers/ReturningQuery';
import { sanitizeIdentifier } from '../../helpers/SanitizeIdentifier';
import { sanitizeParameter } from '../../helpers/SanitizeParameter';
import { valueSubQuery } from '../../helpers/ValueSubQuery';
import { whereQuery } from '../../helpers/WhereQuery';

interface UpsertOne extends Config {
    primaryKey?: string | string[];
    writableCols: string[];
    returnCols?: string | string[];
    permanentFilters?: filters;
}

type QueryFunction = (data: Literal<any>) => Query;

export const upsertOne = ({
    table,
    primaryKey: idCols = 'id',
    writableCols,
    returnCols,
    permanentFilters = {},
}: UpsertOne): QueryFunction => {
    const returning = returningQuery(returnCols);
    const primaryKey = Array.isArray(idCols) ? idCols : [idCols];

    return row => {
        const parameters = {
            ...sanitizeIdentifier(primaryKey, row),
            ...sanitizeParameter(writableCols, row),
        };

        const keys = Object.keys(parameters);
        const values = valueSubQuery(keys, '');

        const setQuery = writableCols
            .filter(column => typeof parameters[column] !== 'undefined')
            .map(column => `${column} = $${column}`);

        const permanentFiltersKeys = Object.keys(permanentFilters);
        const where = permanentFiltersKeys.length
            ? ` ${
                  whereQuery(permanentFilters, permanentFiltersKeys).read()
                      .value
              }`
            : '';

        const sql = `INSERT INTO ${table} (${keys.join(', ')})
VALUES (${values})
ON CONFLICT (${primaryKey.join(', ')})
${
            setQuery.length > 0
                ? `DO UPDATE SET ${setQuery.join(', ')}${where}`
                : 'DO NOTHING'
        }
${returning}`;

        return {
            parameters: {
                ...parameters,
                ...permanentFilters,
            },
            returnOne: true,
            sql,
        };
    };
};
