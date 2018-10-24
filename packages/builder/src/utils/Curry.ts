export const curry = (
    fn: (...args: any[]) => any,
    ...args: any[]
): ((...args: any[]) => any) => {
    if (args.length >= fn.length) {
        return fn(...args);
    }

    return curry.bind(this, fn, ...args);
};
