/**
 * List is a Monad, an Apllicative and a Traversable
 * Hold Array of values, and allow to manipulate them with functions
 * see methods
 */
export default class List<T> {
    // Allow to put a single value in a List
    static of<A>(value: A):List<A> {
        return new List([value]);
    }
    readonly private values: ReadonlyArray<T>
    constructor(values: ReadonlyArray<T>) {
        this.values = values;
    }
    // return the internal array
    toArray():ReadonlyArray<T> {
        return this.values;
    }
    // proxy to Array.concat
    concat(x: T):List<T> {
        return new List(this.values.concat(x));
    }
    // Same as Array.map but without access to index and array
    map<B>(fn: (v:T) => B):List<B> {
        return new List(this.values.map(v => fn(v)));
    }
    /**
     * Convert a List(List(values)) into a List(value)
     * List([List([1]), List([2,3])]) => List([1 ,2 ,3])
     * @this List([List(values), ...])
     * @return List(values)
     */
    flatten<A>():List<A> {
        const values = this.values as any as Array<List<A>>;
        return new List(values.reduce((acc: ReadonlyArray<A>, v:List<A>) => [...acc, ...v.toArray()], []));
    }
    /**
     * Map a function to the values in the List then flatten the result
     * @param: A function returning a List
     * @return List(values)
     */
    chain<A>(fn: (v: T) => List<A>):List<A> {
        return this.map(fn).flatten();
    }
    /**
     * Applicative method
     * Allow to apply values to functions contained in List
     */
    ap<A,B>(other:List<A>):List<B> {
        return this.chain((fn:((v:A) => B) & T):List<B> => other.map(fn));
    }
    /**
     * Traversable method
     * Convert a List(Applicative) into an Applicative(List) while transforming the applicative
     * @this being A List holding Applicatives `List(Applicative)`
     * @param of the applicative constructor
     * @param fn the transformation being applied to the applicative
     * @return Applicative(List)
     */
    traverse(of, fn) {
        return this.values.reduce(swap(fn), of(new List([])));
    }
    /**
     * Traversable method
     * Convert a List(Applicative) into an Applicative(List)
     * @this being A List holding Applicatives: `List(Applicative)`
     * @param of the applicative constructor
     * @return Applicative(List)
     */
    sequence(of) {
        return this.traverse(of, v => v);
    }
};

const concat = values => value => value.concat(values)

const swap = fn => (traversable, applicative) => fn(applicative)
    .map(concat)
    .ap(traversable);
