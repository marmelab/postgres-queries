export const arrayToLitteral = (keys: any, values: any = []) => {
    return keys.reduce(
        (object, key, index) => ({
            ...object,
            [key]: Array.isArray(values) ? values[index] : values,
        }),
        {},
    );
};
