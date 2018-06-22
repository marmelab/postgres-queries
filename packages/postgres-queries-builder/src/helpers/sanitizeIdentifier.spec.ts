import sanitizeIdentifier from './sanitizeIdentifier';

describe('sanitizeIdentifier', () => {
    it('should return identifier if it match primaryKey', () => {
        expect(
            sanitizeIdentifier(['id1', 'id2'], {
                id1: 1,
                id2: 2,
            }),
        ).toEqual({
            id1: 1,
            id2: 2,
        });
    });

    it(`should return literal with primaryKey
        if id value is a simple data type
        and there is only one primaryKey`, () => {
        expect(sanitizeIdentifier(['uid'], 5)).toEqual({
            uid: 5,
        });
    });

    it('should filterout id Keys not present in given primaryKey', () => {
        expect(
            sanitizeIdentifier(['id'], {
                id: 1,
                uid: 2,
            }),
        ).toEqual({
            id: 1,
        });
    });

    it('should throw an error if given ids does not match primaryKey', () => {
        expect(() =>
            sanitizeIdentifier(['id', 'uid'], {
                id: 1,
            }),
        ).toThrow(
            'Invalid identifier: Given object: (id) does not match keys: (id, uid)',
        );
    });

    it('should throw an error if given primaryKey does not match ids', () => {
        expect(() => sanitizeIdentifier(['id', 'uid'], 1)).toThrow(
            'Invalid identifier: Given object: (id) does not match keys: (id, uid)',
        );
    });
});
