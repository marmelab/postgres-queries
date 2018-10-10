export default class Reader {
    private computation: Function;
    static of(value) {
        return new Reader(() => value);
    }
    static ask() {
        return new Reader(value => value);
    }
    constructor(computation) {
        this.computation = computation;
    }
    map(fn) {
        return new Reader(context => fn(this.computation(context)));
    }
    run(context) {
        return this.computation(context);
    }
    chain(fn) {
        return new Reader(context => fn(this.computation(context)).run(context));
    }
}
