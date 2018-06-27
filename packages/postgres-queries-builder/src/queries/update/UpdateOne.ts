import { Config, StringMap } from '../../Configuration';
import { update } from './Update';

interface UpdateOne extends Config {
    writableCols: string[];
    primaryKey: string | string[];
    returnCols?: string[];
    permanentFilters?: StringMap;
}

export const updateOne = ({
    table,
    writableCols,
    primaryKey = 'id',
    returnCols,
    permanentFilters = {},
}: UpdateOne) => {
    const filterCols = [].concat(primaryKey);

    return update(
        { table, writableCols, filterCols, returnCols, permanentFilters },
        true,
    );
};
