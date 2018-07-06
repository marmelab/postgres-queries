import { flatten } from './Flatten';

describe('flatten', () => {
    it('should flatten key containing array', () => {
        expect(flatten({ column: ['value', 'other value', 'etc'] })).toEqual({
            column1: 'value',
            column2: 'other value',
            column3: 'etc',
        });
    });

    it('should not change other key', () => {
        expect(
            flatten({ column: 'value', otherColumn: 'other value' }),
        ).toEqual({
            column: 'value',
            otherColumn: 'other value',
        });
    });

    it('should throw an error if flattened key would overwrite existing key', () => {
        expect(() =>
            flatten({
                column: ['value', 'other value', 'etc'],
                column1: 'already here',
            }),
        ).toThrow(
            'Cannot flatten "column:[value,other value,etc]" parameter, "column1" already exists',
        );
    });
});
