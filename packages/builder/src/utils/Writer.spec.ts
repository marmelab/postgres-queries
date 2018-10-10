import Writer from './Writer';

describe('Writer', () => {
    const identity = v => v;
    const addOne = v => v + 1;
    const double = v => v * 2;
    const addOneWriter = v => Writer.of(v).map(addOne);
    const doubleWriter = v => Writer.of(v).map(double);

    const updateValue = v => `updated ${v}`;
    const updateValueWriter = v => Writer.of(v).map(updateValue);

    it('Functor composition law', () => {
        expect(Writer.of(5).map(double).map(addOne).read())
            .toEqual(Writer.of(5).map(v => addOne(double(v))).read());
    });

    it('Functor identity law', () => {
        expect(Writer.of(5).map(identity).read())
            .toEqual(Writer.of(5).read());
    });

    it('Monad associativity law', () => {
        expect(Writer.of(5).chain(doubleWriter).chain(addOneWriter).read())
            .toEqual(Writer.of(5).chain(v => doubleWriter(v).chain(addOneWriter)).read());
    });

    it('Monad Right identity law', () => {
        expect(
            Writer.of(5).chain(Writer.of).read()
        ).toEqual(
            Writer.of(5).read(),
        );
    });

    it('Monad Left identity law', () => {
        expect(
            Writer.of(5).chain(doubleWriter).read()
        ).toEqual(
            doubleWriter(5).read(),
        );
    });

    it('should allow to augment log with chain', () => {
        const result = new Writer(5, ['initializing writer with 5'])
            .chain(value => new Writer(value * 2, [`doubling ${value}`]))
            .chain(value => new Writer(value + 1, [`incrementing ${value}`]))
            .read();

        expect(result).toEqual({
            value: 11,
            log: [
                'initializing writer with 5',
                'doubling 5',
                'incrementing 10'
            ]
        });
    });
});
