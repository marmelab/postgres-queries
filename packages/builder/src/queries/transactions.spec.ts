import { begin, commit, rollback, savepoint } from './transactions';

describe('Transactions', () => {
    describe('begin', () => {
        it('should return a BEGIN query', () => {
            expect(begin()).toEqual({ sql: 'BEGIN' });
        });
    });

    describe('commit', () => {
        it('should return a COMMIT query', () => {
            expect(commit()).toEqual({ sql: 'COMMIT' });
        });
    });

    describe('savepoint', () => {
        it('should return a SAVEPOINT query', () => {
            expect(savepoint('tmp')).toEqual({ sql: 'SAVEPOINT tmp' });
        });
    });

    describe('rollback', () => {
        it('should return a ROLLBACK query', () => {
            expect(rollback()).toEqual({ sql: 'ROLLBACK' });
        });

        it('should be able to rollback to a savepoint', () => {
            expect(rollback('tmp')).toEqual({ sql: 'ROLLBACK TO tmp' });
        });
    });
});
