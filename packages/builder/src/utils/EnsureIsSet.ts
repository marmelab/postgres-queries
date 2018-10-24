export const ensureIsSet = (id: any) => {
    if (typeof id === 'undefined' || id === null) {
        throw new Error('No value set.');
    }

    return id;
};
