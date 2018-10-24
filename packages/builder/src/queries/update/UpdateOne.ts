import { Config, filters } from '../../Configuration';
import { update } from './Update';

interface UpdateOne extends Config {
    writableCols: string[];
    primaryKey: string | string[];
    returnCols?: string | string[];
    permanentFilters?: filters;
}

export const updateOne = ({
    table,
    writableCols,
    primaryKey = 'id',
    returnCols,
    permanentFilters = {},
}: UpdateOne) => {
    const filterCols = Array.isArray(primaryKey) ? primaryKey : [primaryKey];

    return update(
        { table, writableCols, filterCols, returnCols, permanentFilters },
        true,
    );
};
