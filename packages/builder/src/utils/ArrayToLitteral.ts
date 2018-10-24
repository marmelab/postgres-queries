import { Literal } from '../Configuration';

export const arrayToLitteral = (keys: any, values: any = []) => {
    return keys.reduce(
        (object: Literal<any>, key: string, index: number) => ({
            ...object,
            [key]: Array.isArray(values) ? values[index] : values,
        }),
        {},
    );
};
