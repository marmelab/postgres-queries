import { Config, Query } from '../../Configuration';
import { sanitizeParameter } from '../../helpers/SanitizeParameter';
import { flatten } from '../../utils/Flatten';

interface SelectByOrderedIdentifiers extends Config {
    primaryKey: string | string[];
    returnCols?: string[];
}

type QueryFunction = (values: any[]) => Query;

export const selectByOrderedIdentifiers = ({
    table,
    primaryKey,
    returnCols = ['*'],
}: SelectByOrderedIdentifiers): QueryFunction => values => {
    const identifierName = Array.isArray(primaryKey)
        ? primaryKey[0]
        : primaryKey;
    if (!Array.isArray(values)) {
        throw new Error(
            'selectByOrderedIdentifiers values parameter should be an array',
        );
    }

    const sql = `SELECT ${returnCols
        .map(column => `${table}.${column}`)
        .join(', ')}
FROM ${table}
JOIN (
VALUES ${values
        .map((row, index) => `($${identifierName}${index + 1}, ${index + 1})`)
        .join(', ')}
) AS x (${identifierName}, ordering)
ON ${table}.${identifierName}::varchar=x.${identifierName}
ORDER BY x.ordering;`;

    const parameters = flatten(
        sanitizeParameter([identifierName], {
            [identifierName]: values,
        }),
    );

    return { sql, parameters };
};
