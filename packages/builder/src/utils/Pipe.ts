export const pipe = (...fns: Array<(v: any) => any>) => (
    x: any,
): ((v: any) => any) => fns.reduce((acc, fn) => fn(acc), x);
