export default class List<T> {
    static of<A>(value: A):List<A> {
        return new List([value]);
    }
    private readonly values: ReadonlyArray<T>
    constructor(values: ReadonlyArray<T>) {
        this.values = values;
    }
    toArray():ReadonlyArray<T> {
        return this.values;
    }
    concat(x: T):List<T> {
        return new List(this.values.concat(x));
    }
    map<B>(fn: (v:T) => B):List<B> {
        return new List(this.values.map(v => fn(v)));
    }
    flatten<A>():List<A> {
        const values = this.values as any as Array<List<A>>;
        return new List(values.reduce((acc: ReadonlyArray<A>, v:List<A>) => [...acc, ...v.toArray()], []));
    }
    chain<A>(fn: (v: T) => List<A>):List<A> {
        return this.map(fn).flatten();
    }
    ap<A,B>(other:List<A>):List<B> {
        return this.chain((fn:((v:A) => B) & T):List<B> => other.map(fn));
    }
    traverse(of, fn) {
        return this.values.reduce(
            (f, a) => fn(a).map(b => bs => bs.concat(b)).ap(f),
            of(new List([])),
        );
    }
    sequence(of) {
        return this.traverse(of, v => v);
    }
};
