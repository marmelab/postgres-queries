import { namedToNumericParameter } from './helpers';

describe('Postgres Queries Pool Helpers', () => {
    describe('namedToNumericParameter', () => {
        it('should replace named parameters by number one', () => {
            expect(
                namedToNumericParameter('$one, $two, $three', {
                    one: 'first',
                    two: 'second',
                    three: 'third',
                }),
            ).toEqual({
                parameters: ['first', 'second', 'third'],
                sql: '$1, $2, $3',
            });
        });

        it('should return passed sql and empty array as parameter if no named parameter', () => {
            expect(namedToNumericParameter('no named parameter')).toEqual({
                parameters: [],
                sql: 'no named parameter',
            });
        });

        it('should throw an error if a named token is not in parameter', () => {
            try {
                namedToNumericParameter('$one, $two, $three', {
                    three: 'third',
                });
                expect('it should throw an error').toEqual(
                    'if a named token is not in parameter',
                );
            } catch (error) {
                expect(error.message).toEqual('Missing Parameters: one, two');
            }
        });

        it('should ignore unused parameter', () => {
            expect(
                namedToNumericParameter('$one, $two', {
                    one: 'first',
                    two: 'second',
                    three: 'third',
                }),
            ).toEqual({
                parameters: ['first', 'second'],
                sql: '$1, $2',
            });
        });
    });

    it('should accept null value in parameter', () => {
        expect(
            namedToNumericParameter('$one, $two, $three', {
                one: 'first',
                two: null,
                three: 'third',
            }),
        ).toEqual({
            parameters: ['first', null, 'third'],
            sql: '$1, $2, $3',
        });
    });
});
