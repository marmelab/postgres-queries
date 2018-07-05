import { crud as crudQueries } from './Crud';

describe('crud', () => {
    let crud;

    const table = 'table';
    const primaryKey = ['id1', 'id2'];
    const writableCols = ['col1', 'col2'];
    const returnCols = ['*'];
    const permanentFilters = { col3: 'foo' };

    beforeEach(() => {
        crud = crudQueries({
            permanentFilters,
            primaryKey,
            returnCols,
            table,
            writableCols,
        });
    });

    it('should initialize all queries with given parameters', () => {
        expect(Object.keys(crud)).toEqual([
            'batchInsert',
            'batchRemove',
            'countAll',
            'insertOne',
            'removeOne',
            'select',
            'selectOne',
            'updateOne',
        ]);
    });
});
