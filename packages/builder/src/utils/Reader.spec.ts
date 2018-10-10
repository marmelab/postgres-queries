import Reader from './Reader';

describe('Reader', () => {
    const identity = v => v;
    const addOne = v => v + 1;
    const double = v => v * 2;
    const addOneReader = v => Reader.of(v).map(addOne);
    const doubleReader = v => Reader.of(v).map(double);

    const updateValue = v => `updated ${v}`;
    const updateValueReader = v => Reader.of(v).map(updateValue);

    it('Functor composition law', () => {
        expect(Reader.of(5).map(double).map(addOne).run(null))
            .toEqual(Reader.of(5).map(v => addOne(double(v))).run(null));
    });

    it('Functor identity law', () => {
        expect(Reader.of(5).map(identity).run(null))
            .toEqual(Reader.of(5).run(null));
    });

    it('Monad associativity law', () => {
        expect(Reader.of(5).chain(doubleReader).chain(addOneReader).run(null))
            .toEqual(Reader.of(5).chain(v => doubleReader(v).chain(addOneReader)).run(null));
    });

    it('Monad Right identity law', () => {
        expect(
            Reader.of(5).chain(Reader.of).run(null)
        ).toEqual(
            Reader.of(5).run(null),
        );
    });

    it('Monad Left identity law', () => {
        expect(
            Reader.of(5).chain(doubleReader).run(null)
        ).toEqual(
            doubleReader(5).run(null),
        );
    });

    it('should be lazy', () => {
        const fn = jest.fn();
        Reader.of(5).map(fn).chain(fn);
        expect(fn).toHaveBeenCalledTimes(0);

    });

    describe('run', () => {
        it('should run computation when run is called', () => {
            const computation = jest.fn();
            const r = new Reader(computation);
            expect(computation).toHaveBeenCalledTimes(0);
            r.run('context');
            expect(computation).toHaveBeenCalledWith('context');

        });
    });


    describe('ask', () => {
        it('should create a reader with the context as its initial value', () => {
            const fn = jest.fn();
            Reader.ask().map(fn).run('context');
            expect(fn).toHaveBeenCalledWith('context');
        });
    });

    describe('of', () => {
        it('should create a reader holding value', () => {
            const fn = jest.fn();
            Reader.of('value').map(fn).run('context');
            expect(fn).toHaveBeenCalledWith('value');
        });
    });

    describe('chain', () => {
        it('should allow to access the context in the chained Reader', () => {
            const fn = jest.fn();
            const monadFn = jest.fn(value => new Reader(context => fn(context, value)));
            Reader.of('value').chain(monadFn).run('context');
            expect(monadFn).toHaveBeenCalledWith('value');
            expect(fn).toHaveBeenCalledWith('context', 'value');
        });

        it('should preserve the context', () => {
            const fn = jest.fn();
            const monadFn = jest.fn(value => new Reader(context => fn(context, value)));
            Reader.of('value').chain(updateValueReader).chain(monadFn).run('context');
            expect(monadFn).toHaveBeenCalledWith('updated value');
            expect(fn).toHaveBeenCalledWith('context', 'updated value');

        });
    });

    describe('map', () => {
        it('should preserve the context', () => {
            const fn = jest.fn();
            const monadFn = jest.fn(value => new Reader(context => fn(context, value)));
            Reader.of('value').map(updateValue).chain(monadFn).run('context');
            expect(monadFn).toHaveBeenCalledWith('updated value');
            expect(fn).toHaveBeenCalledWith('context', 'updated value');

        });
    });
});
