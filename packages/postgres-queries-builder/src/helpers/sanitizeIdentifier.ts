import checkLiteralKeys from '../utils/checkLiteralKeys';
import curry from '../utils/curry';
import ensureIsSet from '../utils/ensureIsSet';
import pipe from '../utils/pipe';
import sanitizeParameter from './sanitizeParameter';

export const normalize = primaryKey => id =>
    typeof id === 'object' ? id : { [primaryKey[0]]: id };

export const sanitizeIdentifierFunc = (primaryKey, id) => {
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

export default curry(sanitizeIdentifierFunc);
