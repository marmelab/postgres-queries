import { Literal } from '../Configuration';

export const addSuffix = (object: Literal<any>, suffix: string | number) =>
    Object.keys(object).reduce(
        (result, key) => ({
            ...result,
            [key + suffix]: object[key],
        }),
        {},
    );
