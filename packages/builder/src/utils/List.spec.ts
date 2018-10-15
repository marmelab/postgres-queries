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
            expect(List.of(5).map(double).map(addOne).values)
                .toEqual(List.of(5).map(v => addOne(double(v))).values);
        });

        it('Functor identity law', () => {
            expect(List.of(5).map(identity).values)
                .toEqual(List.of(5).values);
        });
    });

    describe('Monad Law', () => {
        it('Monad associativity law', () => {
            expect(List.of(5).chain(doubleList).chain(addOneList).values)
                .toEqual(List.of(5).chain(v => doubleList(v).chain(addOneList)).values);
        });

        it('Monad Right identity law', () => {
            expect(
                List.of(5).chain(List.of).values
            ).toEqual(
                List.of(5).values,
            );
        });

        it('Monad Left identity law', () => {
            expect(
                List.of(5).chain(doubleList).values
            ).toEqual(
                doubleList(5).values,
            );
        });
    });

    describe('Applicative Functor Law', () => {
        it('Identity', () => {
            expect(
                List.of(identity).ap(List.of(5)).values,
            ).toEqual(
                List.of(5).values,
            );
        });

        it('Homomorphism', async () => {
            await expect(
                List.of(double).ap(List.of(5)).values,
            ).toEqual(
                List.of(double(5)).values,
            );
        });

        it('Interchange', async () => {
            await expect(
                List.of(double).ap(List.of(5)).values,
            ).toEqual(
                List.of(5).map(double).values,
            );
        });

        it('composition', async () => {
            const u = List.of(v => 'u');
            const v = List.of(v => v + 'v');
            const w = List.of('w');
            const compose = f1 => f2 => v => f1(f2(v));
            await expect(
                u.ap(v.ap(w)).values,
            ).toEqual(
                List.of(compose).ap(u).ap(v).ap(w).values,
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

});
