import { Config, filters, Literal, Query } from '../../Configuration';
import { remove } from './Remove';

interface RemoveOne extends Config {
    primaryKey: string | string[];
    returnCols: string | string[];
    permanentFilters?: filters;
}

type QueryFunction = (ids: Literal<any>) => Query;

export const removeOne = ({
    table,
    primaryKey = 'id',
    returnCols,
    permanentFilters = {},
}: RemoveOne): QueryFunction => {
    const filterCols = Array.isArray(primaryKey) ? primaryKey : [primaryKey];

    return remove(
        {
            filterCols,
            permanentFilters,
            returnCols,
            table,
        },
        true,
    );
};
