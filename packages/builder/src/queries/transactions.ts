export const begin = () => ({ sql: 'BEGIN' });

export const commit = () => ({ sql: 'COMMIT' });

export const savepoint = (name: string) => ({ sql: `SAVEPOINT ${name}` });

export const rollback = (to?: string) => ({
    sql: to ? `ROLLBACK TO ${to}` : 'ROLLBACK',
});
