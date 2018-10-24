import { curry } from '../utils/Curry';

const valueSubQueryFunc = (writableCols: string[], suffix: string) =>
    writableCols.map(column => `$${column}${suffix}`).join(', ');

export const valueSubQuery = curry(valueSubQueryFunc);
