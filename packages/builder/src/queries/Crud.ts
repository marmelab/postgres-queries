import { Config, filters, Literal } from '../Configuration';

import { batchInsert as batchInsertQuery } from './insert/BatchInsert';
import { insertOne as insertOneQuery } from './insert/InsertOne';
import { batchRemove as batchRemoveQuery } from './remove/BatchRemove';
import { removeOne as removeOneQuery } from './remove/RemoveOne';
import { count as countAllQuery } from './select/Count';
import { select as selectQuery } from './select/Select';
import { selectOne as selectOneQuery } from './select/SelectOne';
import { updateOne as updateOneQuery } from './update/UpdateOne';

interface Crud extends Config {
    primaryKey: string | string[];
    returnCols: string[];
    writableCols: string[];
    searchableCols?: string[];
    specificSorts?: Literal<any>;
    groupByCols?: string[];
    withQuery?: boolean;
    permanentFilters?: filters;
}

export const crud = ({
    table,
    primaryKey = 'id',
    returnCols,
    writableCols,
    searchableCols,
    specificSorts,
    groupByCols,
    withQuery,
    permanentFilters = {},
}: Crud) => {
    const removeOne = removeOneQuery({
        permanentFilters,
        primaryKey,
        returnCols,
        table,
    });

    const insertOne = insertOneQuery({ table, writableCols, returnCols });

    const selectOne = selectOneQuery({
        permanentFilters,
        primaryKey,
        returnCols,
        table,
    });

    const select = selectQuery({
        groupByCols,
        permanentFilters,
        primaryKey,
        returnCols,
        searchableCols,
        specificSorts,
        table,
        withQuery,
    });

    const updateOne = updateOneQuery({
        permanentFilters,
        primaryKey,
        returnCols,
        table,
        writableCols,
    });

    const batchInsert = batchInsertQuery({ table, writableCols, returnCols });

    const batchRemove = batchRemoveQuery({
        permanentFilters,
        primaryKey,
        returnCols,
        table,
    });

    const countAll = countAllQuery({
        permanentFilters,
        table,
    });

    const queries = {
        batchInsert,
        batchRemove,
        countAll,
        insertOne,
        removeOne,
        select,
        selectOne,
        updateOne,
    };

    return queries;
};
