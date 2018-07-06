export const returningQuery = (cols: string | string[] = '*') => {
    if (cols === '*') {
        return 'RETURNING *';
    }

    if (!Array.isArray(cols) || !cols.length) {
        return '';
    }

    return `RETURNING ${cols.join(', ')}`;
};
