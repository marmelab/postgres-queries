import { Literal } from '../Configuration';
import { arrayToLitteral } from '../utils/ArrayToLitteral';
import { curry } from '../utils/Curry';
import { getColType } from './WhereQuery';

function getTrueColName(colName: string, cols: string[]) {
    switch (getColType(colName, cols).readValue()) {
        case 'query':
            return colName;
        case 'from':
            return colName.substr(5);
        case 'to':
            return colName.substr(3);
        case 'like':
            return colName.substr(5);
        case 'notLike':
            return colName.substr(9);
        case 'not':
            return colName.substr(4);
        default:
            return null;
    }
}

function sanitizeParameterFunc(
    rawCols: Literal<string> | string[],
    parameters: Literal<
        string | number | boolean | string[] | number[] | boolean[]
    >,
) {
    const cols = Array.isArray(rawCols)
        ? arrayToLitteral(rawCols, undefined)
        : rawCols;
    const colNames = Object.keys(cols);

    return Object.keys({ ...cols, ...parameters }).reduce(
        (sanitizedParameters, colName) => {
            const trueColName = getTrueColName(colName, colNames);
            if (!trueColName) {
                return sanitizedParameters;
            }

            let value =
                typeof parameters[colName] === 'undefined'
                    ? cols[trueColName]
                    : parameters[colName];
            if (
                colName.replace(trueColName, '') === 'like_' ||
                colName.replace(trueColName, '') === 'not_like_'
            ) {
                value = `%${value}%`;
            }

            return typeof value === 'undefined'
                ? sanitizedParameters
                : {
                      ...sanitizedParameters,
                      [colName.replace('.', '__')]: value,
                  };
        },
        parameters.match && colNames.length > 0
            ? { match: `%${parameters.match}%` }
            : {},
    );
}

export const sanitizeParameter = curry(sanitizeParameterFunc);
