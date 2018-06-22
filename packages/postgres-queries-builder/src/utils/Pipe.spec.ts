import { pipe } from './Pipe';

describe('pipe', () => {
    it('should create a function composed of the given function', () => {
        const hello = () => 'hello';
        const addSpace = str => str.concat(' ');
        const addWorld = str => str.concat('world');
        const helloWorld = pipe(
            hello,
            addSpace,
            addWorld,
        );
        expect(helloWorld()).toEqual('hello world');
    });
});
