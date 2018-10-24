import { Literal } from '../Configuration';

export const combineLiterals = (
    literals: Array<Literal<any>>,
): Literal<any[]> =>
    literals.reduce(
        (result, literal) => ({
            ...result,
            ...Object.keys(literal).reduce(
                (r, key) => ({
                    ...r,
                    [key]: (result[key] || []).concat(literal[key]),
                }),
                {},
            ),
        }),
        {},
    );
