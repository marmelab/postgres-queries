import { curry } from '../utils/Curry';

function valueSubQueryFunc(writableCols, suffix) {
    return writableCols.map(column => `$${column}${suffix}`).join(', ');
}

export const valueSubQuery = curry(valueSubQueryFunc);
