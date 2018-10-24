const tokenPattern = /\$[a-zA-Z]([a-zA-Z0-9_]*)\b/g;

interface ParameterizedQuery {
    sql: string;
    parameters: any[];
}

interface Literal<T> {
    [key: string]: T;
}

export const namedToNumericParameter = (
    namedSql: string,
    namedParameters: Literal<any> = {},
): ParameterizedQuery => {
    const fillableTokens = Object.keys(namedParameters);
    const matchedTokens = namedSql.match(tokenPattern);
    if (!matchedTokens) {
        return { sql: namedSql, parameters: [] };
    }
    const sanitizedTokens = matchedTokens
        .map(token => token.substring(1)) // Remove leading dollar sign
        .filter((value, index, self) => self.indexOf(value) === index);

    const fillTokens = fillableTokens.filter(
        value => sanitizedTokens.indexOf(value) > -1,
    );

    const parameters = fillTokens.map(token => namedParameters[token]);

    const unmatchedTokens = sanitizedTokens.filter(
        value => fillableTokens.indexOf(value) < 0,
    );

    if (unmatchedTokens.length) {
        throw new Error(`Missing Parameters: ${unmatchedTokens.join(', ')}`);
    }

    const sql = fillTokens.reduce((partiallyInterpolated, token, index) => {
        const replaceAllPattern = new RegExp(`\\$${fillTokens[index]}\\b`, 'g');

        return partiallyInterpolated.replace(
            replaceAllPattern,
            `$${index + 1}`,
        );
    }, namedSql);

    return {
        parameters,
        sql,
    };
};
