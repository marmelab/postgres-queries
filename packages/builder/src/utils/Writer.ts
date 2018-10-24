/**
 * Writer Monad
 * Allow to map function to a value while maintaining an array of log
 * @constructor create a Writer with given value and array of logs
 * @method map apply function the values holded by the writer, think like Array.map
 * @method chain Allow to access and extends the log by chaining another Writer
 *     writer.chain(value => {
 *         // change the value, create additionalLogs
 *         return new Writer(newValue, additionalLogs);
 *     })
 * @method of place a value in a new Writer with empty log
 * @method lift transform a function to wrap its return value in a Writer
 */
export default class Writer<T> {
    public static of<T>(value: T): Writer<T> {
        return new Writer(value, []);
    }
    /**
     * Lift a function in a Writer
     * @param fn the function to lift
     * @param a new Function applying fn and wrapping its return value in a writer
     */
    public static lift(fn: (...v: any[]) => any) {
        return (...args: any[]) => Writer.of(fn(...args));
    }
    private readonly value: T;
    private readonly log: any[];
    constructor(value: T, log: any[] = []) {
        this.value = value;
        this.log = log;
    }
    public read() {
        return { value: this.value, log: this.log };
    }
    public readValue() {
        return this.value;
    }
    public readLog() {
        return this.log;
    }
    public map<B>(fn: (v: T) => B): Writer<B> {
        return new Writer(fn(this.value), this.log);
    }
    /**
     * Allow to apply a value to a function holded by the Writer
     * @param other A writer hilding the value to apply
     * @this A writer holding a function
     */
    public ap<A, B>(other: Writer<A>): Writer<B> {
        return this.chain((fn: ((v: A) => B) & T) => other.map(fn));
    }
    public flatten<A>(): Writer<A> {
        const inner = (this.value as any) as Writer<A>;
        return new Writer(inner.value, this.log.concat(inner.log));
    }
    /**
     * Allow to access and extends the log by chaining another Writer
     *     writer.chain(value => {
     *         // change the value, create additionalLogs
     *         return new Writer(newValue, additionalLogs);
     *     })
     * @param fn A function returning a Writer
     * @return A new Writer holding the value from the nested Writer, and the logs from both
     */
    public chain<A>(fn: (v: T) => Writer<A>): Writer<A> {
        const inner = fn(this.value).read();
        return new Writer(inner.value, this.log.concat(inner.log));
    }
}
