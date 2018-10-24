import Writer from './Writer';

describe('Writer', () => {
    const identity = v => v;
    const addOne = v => v + 1;
    const double = v => v * 2;
    const addOneWriter = v => Writer.of(v).map(addOne);
    const doubleWriter = v => Writer.of(v).map(double);

    describe('Functor law', () => {
        it('Functor composition law', () => {
            expect(
                Writer.of(5)
                    .map(double)
                    .map(addOne)
                    .read(),
            ).toEqual(
                Writer.of(5)
                    .map(v => addOne(double(v)))
                    .read(),
            );
        });

        it('Functor identity law', () => {
            expect(
                Writer.of(5)
                    .map(identity)
                    .read(),
            ).toEqual(Writer.of(5).read());
        });
    });

    describe('Monad Law', () => {
        it('Monad associativity law', () => {
            expect(
                Writer.of(5)
                    .chain(doubleWriter)
                    .chain(addOneWriter)
                    .read(),
            ).toEqual(
                Writer.of(5)
                    .chain(v => doubleWriter(v).chain(addOneWriter))
                    .read(),
            );
        });

        it('Monad Right identity law', () => {
            expect(
                Writer.of(5)
                    .chain(Writer.of)
                    .read(),
            ).toEqual(Writer.of(5).read());
        });

        it('Monad Left identity law', () => {
            expect(
                Writer.of(5)
                    .chain(doubleWriter)
                    .read(),
            ).toEqual(doubleWriter(5).read());
        });
    });

    describe('Applicative Functor Law', () => {
        it('Identity', () => {
            expect(
                Writer.of(identity)
                    .ap(Writer.of(5))
                    .read(),
            ).toEqual(Writer.of(5).read());
        });

        it('Homomorphism', async () => {
            await expect(
                Writer.of(double)
                    .ap(Writer.of(5))
                    .read(),
            ).toEqual(Writer.of(double(5)).read());
        });

        it('Interchange', async () => {
            await expect(
                Writer.of(double)
                    .ap(Writer.of(5))
                    .read(),
            ).toEqual(
                Writer.of(5)
                    .map(double)
                    .read(),
            );
        });

        it('composition', async () => {
            const u = Writer.of(() => 'u');
            const v = Writer.of(value => value + 'v');
            const w = Writer.of('w');
            const compose = f1 => f2 => value => f1(f2(value));
            await expect(u.ap(v.ap(w)).read()).toEqual(
                Writer.of(compose)
                    .ap(u)
                    .ap(v)
                    .ap(w)
                    .read(),
            );
        });
    });

    it('should allow to add log with chain', () => {
        const result = new Writer(5, ['initializing writer with 5'])
            .chain(value => new Writer(value * 2, [`doubling ${value}`]))
            .chain(value => new Writer(value + 1, [`incrementing ${value}`]))
            .read();

        expect(result).toEqual({
            value: 11,
            log: [
                'initializing writer with 5',
                'doubling 5',
                'incrementing 10',
            ],
        });
    });
});
