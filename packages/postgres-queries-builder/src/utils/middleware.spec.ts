import middleware from './middleware';

describe('middleware', () => {
    it('should execute used function f with options, and null', () => {
        let receivedArgs;
        const f = function(...args) {
            receivedArgs = args;

            return 'fResult';
        };
        const result = middleware('entry', 'options')
            .use(f)
            .execute('empty result');

        expect(receivedArgs).toEqual(['entry', 'options', 'empty result']);
        expect(result).toEqual('fResult');
    });

    it('should execute used function in order, passing result of the previous one to the next', () => {
        let firstArguments;
        let nextArguments;
        const first = function(...args) {
            firstArguments = args;
            return 'firstResult';
        };
        const next = function(...args) {
            nextArguments = args;
            return 'nextResult';
        };
        const result = middleware('entry', 'options')
            .use(first)
            .use(next)
            .execute('empty result');

        expect(firstArguments).toEqual(['entry', 'options', 'empty result']);
        expect(nextArguments).toEqual(['entry', 'options', 'firstResult']);
        expect(result).toEqual('nextResult');
    });

    it('should apply used functon to targeted entry key', () => {
        let targetPileArguments;
        let targetFaceArguments;
        const targetPile = function(...args) {
            targetPileArguments = args;
            return 'targetPileResult';
        };
        const targetFace = function(...args) {
            targetFaceArguments = args;
            return 'targetFaceResult';
        };
        const result = middleware({ pile: 'tic', face: 'tac' }, 'options')
            .use(targetPile, 'pile')
            .use(targetFace, 'face')
            .execute('empty result');

        expect(targetPileArguments).toEqual(['tic', 'options', 'empty result']);
        expect(targetFaceArguments).toEqual([
            'tac',
            'options',
            'targetPileResult',
        ]);
        expect(result).toEqual('targetFaceResult');
    });
});
