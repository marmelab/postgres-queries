import { checkLiteralKeys } from '../utils/CheckLiteralKeys';
import { curry } from '../utils/Curry';
import { ensureIsSet } from '../utils/EnsureIsSet';
import { pipe } from '../utils/Pipe';
import { sanitizeParameter } from './SanitizeParameter';

export const normalize = (primaryKey: string[]) => (id: string | object) =>
    typeof id === 'object' ? id : { [primaryKey[0]]: id };

export const sanitizeIdentifierFunc = (primaryKey: string[], id: string) => {
    try {
        return pipe(
            ensureIsSet,
            normalize(primaryKey),
            sanitizeParameter(primaryKey),
            checkLiteralKeys(primaryKey),
        )(id);
    } catch (error) {
        throw new Error(`Invalid identifier: ${error.message}`);
    }
};

export const sanitizeIdentifier = curry(sanitizeIdentifierFunc);
