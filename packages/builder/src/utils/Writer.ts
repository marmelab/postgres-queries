
export default class Writer<T> {
    private readonly value: T;
    private readonly log: any[];
    static of<T>(value: T):Writer<T> {
        return new Writer(value, []);
    }
    static lift(fn) {
        return (...args) => Writer.of(fn(...args));
    }
    constructor(value:T, log:any[] = []) {
        this.value = value;
        this.log = log;
    }
    read() {
        return { value: this.value, log: this.log };
    }
    map<B>(fn: (v:T) => B):Writer<B> {
        return new Writer(fn(this.value), this.log);
    }
    ap<A,B>(other:Writer<A>):Writer<B> {
        return this.chain((fn:((v: A) => B) & T) => other.map(fn));
    }
    flatten<A>():Writer<A> {
        const inner = this.value as any as Writer<A>;
        return new Writer(inner.value, this.log.concat(inner.log));
    }
    chain<A>(fn: (v: T) => Writer<A>):Writer<A> {
        const inner = fn(this.value).read();
        return new Writer(inner.value, this.log.concat(inner.log));
    }
}
