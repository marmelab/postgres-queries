import { Literal } from '../Configuration';

export const flatten = <T>(parameters: Literal<T | T[]>): Literal<T> =>
    Object.keys(parameters).reduce((result, key) => {
        const parameter = parameters[key];
        if (!Array.isArray(parameter)) {
            return {
                ...result,
                [key]: parameters[key],
            };
        }

        const multiKey = parameter.reduce(
            (keys: Literal<T>, value: T, index: number) => {
                const newKey = `${key}${index + 1}`;
                if (typeof parameters[newKey] !== 'undefined') {
                    throw new Error(
                        `Cannot flatten "${key}:[${parameter}]" parameter, "${key}${index +
                            1}" already exists.`,
                    );
                }
                return {
                    ...keys,
                    [newKey]: value,
                };
            },
            {},
        );

        return {
            ...result,
            ...multiKey,
        };
    }, {});
