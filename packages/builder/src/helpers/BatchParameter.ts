import { addSuffix } from '../utils/AddSuffix';
import { arrayToLitteral } from '../utils/ArrayToLitteral';
import { sanitizeParameter } from './SanitizeParameter';

export const batchParameter = cols => {
    const sanitize = sanitizeParameter(arrayToLitteral(cols, null));

    return rows =>
        rows
            .map(sanitize)
            .map((row, index) => addSuffix(row, index + 1))
            .reduce((result, row) => ({ ...result, ...row }), {});
};
