import List from './List';
import Writer from './Writer';

describe('List', () => {
    const identity = v => v;
    const addOne = v => v + 1;
    const double = v => v * 2;
    const addOneList = v => List.of(v).map(addOne);
    const doubleList = v => List.of(v).map(double);

    describe('Functor law', () => {
        it('Functor composition law', () => {
            expect(List.of(5).map(double).map(addOne))
                .toEqual(List.of(5).map(v => addOne(double(v))));
        });

        it('Functor identity law', () => {
            expect(List.of(5).map(identity))
                .toEqual(List.of(5));
        });
    });

    describe('Monad Law', () => {
        it('Monad associativity law', () => {
            expect(List.of(5).chain(doubleList).chain(addOneList))
                .toEqual(List.of(5).chain(v => doubleList(v).chain(addOneList)));
        });

        it('Monad Right identity law', () => {
            expect(
                List.of(5).chain(List.of)
            ).toEqual(
                List.of(5),
            );
        });

        it('Monad Left identity law', () => {
            expect(
                List.of(5).chain(doubleList)
            ).toEqual(
                doubleList(5),
            );
        });
    });

    describe('Applicative Functor Law', () => {
        it('Identity', () => {
            expect(
                List.of(identity).ap(List.of(5)),
            ).toEqual(
                List.of(5),
            );
        });

        it('Homomorphism', async () => {
            await expect(
                List.of(double).ap(List.of(5)),
            ).toEqual(
                List.of(double(5)),
            );
        });

        it('Interchange', async () => {
            await expect(
                List.of(double).ap(List.of(5)),
            ).toEqual(
                List.of(5).map(double),
            );
        });

        it('composition', async () => {
            const u = List.of(v => 'u');
            const v = List.of(v => v + 'v');
            const w = List.of('w');
            const compose = f1 => f2 => v => f1(f2(v));
            await expect(
                u.ap(v.ap(w)),
            ).toEqual(
                List.of(compose).ap(u).ap(v).ap(w),
            );
        });
    });

    describe('Traversable Law', () => {
        // see https://mostly-adequate.gitbooks.io/mostly-adequate-guide/ch12.html#no-law-and-order

        class Identity {
            value: any;
            constructor(value) {
                this.value = value;
            }
            static of(value) {
                return new Identity(value);
            }
            map(fn) {
                return Identity.of(fn(this.value));
            }
            flatten() {
                return this.value;
            }
            chain(fn) {
                return this.map(fn).flatten();
            }
            ap(other) {
                return new Identity(this.value(other.flatten()));
            }
            traverse(of, fn){
                return fn(this.value).map(Identity.of);
            }
            sequence(of) {
                return this.traverse(of, v => v);
            }
        }

        class Compose {
            value: any;
            constructor(value) {
                this.value = value;
            }
            static of(value) {
                return new Compose(value);
            }
            map(fn){
                return new Compose(this.value.map(x => x.map(fn)));
            }
            ap(v) {
                return this.map(fn => v.map(fn).value);
            }
        };

        it('Identity', async () => {
            await expect(
                List.of('value').map(Identity.of).sequence(Identity.of).flatten().values,
            ).toEqual(
                Identity.of(List.of('value')).flatten().values,
            );
        });

        it('Composition', async () => {
            const identityOfIdentityOfList = Identity.of(Writer.of(List.of(true)));
            expect(
                identityOfIdentityOfList.map(Compose.of).sequence(Compose.of),
            ).toEqual(
                Compose.of(identityOfIdentityOfList.sequence(List.of).map(v => v.sequence(List.of))),
            );
        });

        it('Naturality', () => {
            const writerToList = writer => List.of(writer.read().value);

            const listOfWriter = List.of(Writer.of('value'))

            expect(
                writerToList(listOfWriter.sequence(Writer.of)),
            ).toEqual(
                listOfWriter.map(writerToList).sequence(List.of),
            );
        });
    });

    describe('sequence', () => {
        it('should convert List([Writer(value), ...]) to a Writer(List([value, ...])) while preserving all log', () => {
            const writerList = new List([new Writer(1, ['zero', 'one']), new Writer(2, ['two']), new Writer(3, ['three'])]);
            expect(writerList.sequence(Writer.of)).toEqual(
                new Writer(new List([1,2,3]), ['three', 'two', 'zero', 'one']),
            );
        });
    });

    describe('ap', () => {
        it('should apply list of values to list of functions', () => {
            const functionsList = new List([v => v + 10, v => v * 2]);
            const valuessList = new List([1, 2, 3]);
            expect(functionsList.ap(valuessList)).toEqual(new List([11, 12, 13, 2, 4, 6]));
        });
    });

    describe('flatten', () => {
        it('should flatten List', () => {
            expect(new List([
                new List([1]),
                new List([2, 3]),
                new List([4, 5, 6]),
            ]).flatten()).toEqual(new List([1, 2, 3, 4, 5, 6]));
        });
    });

    describe('chain', () => {
        it('should map fn then flatten the result', () => {
            expect(new List(['hello', ' ', 'world']).chain(word => new List(word.split(''))))
                .toEqual(new List(['h','e', 'l', 'l', 'o',' ', 'w', 'o', 'r', 'l', 'd']));
        });
    });
});
