export default class List {
    static of(value) {
        return new List([value]);
    }
    values: any[]
    constructor(values) {
        this.values = values;
    }
    map(fn) {
        return new List(this.values.map(v => fn(v)));
    }
    ap(other) {
        return this.chain(fn => other.map(fn));
    }
    flatten() {
        new List(this.values.reduce((acc, v) => [...acc, ...v.values], []));
    }
    chain(fn) {
        return this.map(fn).flatten();
    }
    concat(x) {
        return new List(this.values.concat(x));
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
    toArray() {
        return this.values;
    }
};
