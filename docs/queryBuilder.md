---
layout: default
title: "Query Builder"
---
# Query Builder

- [Crud](#crud)
- [SelectOne](#selectone)
- [Select](#select)
- [CountAll](#countall)
- [InsertOne](#insertone)
- [Update](#update)
- [UpdateOne](#updateone)
- [Remove](#remove)
- [RemoveOne](#removeone)
- [BatchRemove](#batchremove)
- [UpsertOne](#upsertone)
- [BatchUpsert](#batchupsert)
- [SelectByOrderedIdentifiers](#selectbyorderedidentifiers)
- [Transactions](#transactions)

## `Crud`

```js
import { crud}  from 'postgres-queries';

crud({
    table,
    writableCols,
    primaryKey,
    returnCols,
    permanentFilters
});
```

Creates configured queries for insertOne, batchInsert, selectOne, select, updateOne, deleteOne and batchDelete.

### Configuration

- [table](configuration.html#table)
- [primaryKey](configuration.html#primarykey)
- [writableCols](configuration.html#writablecols)
- [returnCols](configuration.html#returncols)
- [searchableCols](configuration.html#searchablecols)
- [specificSorts](configuration.html#specificsorts)
- [groupByCols](configuration.html#groupbycols)
- [withQuery](configuration.html#withquery)
- [permanentFilters](configuration.html#permanentfilters)

## `SelectOne`

Allows to create a select query to retrieve one row based on a primaryKey.

```js
import { selectOne } from 'postgres-queries';

const selectOneUser = selectOne({
    table: 'user',
    primaryKey: ['id', 'uid'],
    returnCols: ['id', 'name'],
    permanentFilters: {},
}); // first we pass a configuration object

selectOneUser({ id: 1, uid: 2 }); // and then we pass the identifier
// to get the result:
{
    sql: `SELECT id, name FROM user WHERE id=$id AND uid=$uid;`,
    parameters: {
        id: 1,
        uid: 2,
    },
    returnOne: true,
}
```

Here are all the available configuration:

- table: the table name the



Creates a query to select one row by primaryKey.

### Configuration

- [table](configuration.html#table)
- [primaryKey](configuration.html#primarykey)
- [returnCols](configuration.html#returncols)
- [permanentFilters](configuration.html#permanentfilters)

### Parameters

Either a single value or a literal representing the identifier.

```js
{
    id1: value,
    id2: value,
    ...
}
```

When passing a literan any key not present in primaryKey will be ignored.
When passing a single value it will be mapped to the first primaryKey.

## `Select`

Creates a query to select one row.

```js
import { select } from 'postgres-queries';

select({
  table,
  primaryKey,
  returnCols,
  searchableCols,
  specificSorts,
  groupByCols,
  withQuery,
  permanentFilters,
  returnOne
})({ limit, offset, filters, sort, sortDir });
```

### Configuration

- [table](configuration.html#table)
- [primaryKey](configuration.html#primarykey)
- [returnCols](configuration.html#returncols)
- [searchableCols](configuration.html#searchablecols)
- [specificSorts](configuration.html#specificsorts)
- [groupByCols](configuration.html#groupbycols)
- [withQuery](configuration.html#withquery)
- [permanentFilters](configuration.html#permanentfilters)
- [returnOne](configuration.html#returnone)

### Parameters

A literal object with:

* **limit:** number of results to be returned
* **offset:** number of results to be ignored
* **filters:** a object taking as keys the column to filter on and as values the filter values

For instance, specifying the following **filters** value:

```js
{
    first_name: "John",
    last_name: "Doe",
    last_paid_at: null,
}
```

Will produce the following `WHERE` clause:

```sql
WHERE
    first_name = 'John'
    AND last_name = 'Doe'
    AND last_paid_at IS NULL
```

Other SQL matching operators may be used by specifying some prefixes to the column names. For instance:

```js
{
    not_first_name: "John",           // first_name != "John"
    not_last_paid_at: null,           // last_paid_at IS NOT NULL
    from_last_paid_at: '2010-01-01',  // last_paid_at >= '2010-01-01'
    to_last_paid_at: '3010-01-01',    // last_paid_at <= '3010-01-01'
    like_position: 'Sales',           // position ILIKE '%Sales%'
    not_like_position: 'Manager'      // position NOT ILIKE '%Manager%'
}
```

It is also possible to match to all searchable column with match:

```js
{
    match: 'value',
}
```

will return only row for which any searchableCols matching value (case insensitive).

* **sort**
    Specify the column by which to filter the result (Additionally the result will always get sorted by the row identifiers to avoid random order)
* **sortDir**
    Specify the sort direction, either 'ASC' or 'DESC'

## `CountAll`

Create a query to count all rows. It also takes an optional plain object parameter `filters`, applied to the query in addition to the `permanentFilters`.

```js
import { countAll } from 'postgres-queries';

countAll({ table, permanentFilters })({ filters: { enabled: true } });
```

### Configuration

- [table](configuration.html#table)
- [permanentFilters](configuration.html#permanentfilters)

## `InsertOne`

Creates a query to insert a row in the database.

```js
import { insertOne } from 'postgres-queries';

insertOne({
  table,
  writableCols,
  returnCols,
})(data);
```

### Configuration

- [table](configuration.html#table)
- [writableCols](configuration.html#writablecols)
- [returnCols](configuration.html#returncols)

### Parameters

One argument:
- data: a literal specifying the column to insert

## `Update`

Creates a query to update rows.

```js
import { update } from 'postgres-queries';

update({
    table,
    writableCols,
    filterCols,
    returnCols,
    permanentFilters
})(filters, data);
```

### Configuration

- [table](configuration.html#table)
- [writableCols](configuration.html#writablecols)
- [filterCols](configuration.html#filtercols)
- [returnCols](configuration.html#returncols)
- [permanentFilters](configuration.html#permanentfilters)

### Parameters

Two arguments:

- filters:
    literal specifying wanted value for given column
    example:
    ```js
    {
        column: "value";
    }
    ```
    will update only row for which column equal 'value'
- data: a literal specifying the new values

## `UpdateOne`

Creates a query to update one row.

```js
import updateOne from "co-postgres-queries/queries/updateOne";
updateOne({
  table,
  writableCols,
  primaryKey,
  returnCols,
  permanentFilters
})(identifier, data);
```

### Configuration

- [table](configuration.html#table)
- [writableCols](configuration.html#writablecols)
- [primaryKey](configuration.html#primarykey)
- [returnCols](configuration.html#returncols)
- [permanentFilters](configuration.html#permanentfilters)

### Parameters

Two arguments:

- identifier: either a single value for a single primaryKey column, or a literal if several columns:`{ id1: value, id2: otherValue }`. All configured primaryKey columns must be given a value.
- data: a literal specifying the column to update

## `Remove`

Creates a query to delete rows.

```js
import remove from "co-postgres-queries/queries/remove";
remove({ table, filterCols, returnCols, permanentFilters })(filters);
```

### Configuration

- [table](configuration.html#table)
- [filterCols](configuration.html#filtercols)
- [returnCols](configuration.html#returncols)
- [permanentFilters](configuration.html#permanentfilters)

### Parameters

A literal specifying wanted value for given column
example:

```js
{
    column: "value";
}
```

will update only row for which column equal 'value'

## `RemoveOne`

Creates a query to delete one row.

```js
import { removeOne } from 'postgres-queries';

removeOne({ table, primaryKey, returnCols, permanentFilters })(identitfier);
```

### Configuration

- [table](configuration.html#table)
- [primaryKey](configuration.html#primarykey)
- [returnCols](configuration.html#returncols)
- [permanentFilters](configuration.html#permanentfilters)

### Parameters

The identifier: either a single value for a single primaryKey column, or a literal if several columns:`{ id1: value, id2: otherValue }`. All configured primaryKey columns must be given a value.

## `BatchRemove`

Allow to create a query to delete several row at once

```js
import { batchRemove } from 'postgres-queries';

batchRemove({ table, primaryKey, returnCols, permanentFilters })(
    identifierList
);
```

### Configuration

- [table](configuration.html#table)
- [primaryKey](configuration.html#primarykey)
- [returnCols](configuration.html#returncols)
- [permanentFilters](configuration.html#permanentfilters)

### Parameters

The list of identifier either an array of single value for a single primaryKey column, or an array of literal if several columns:`[{ id1: value, id2: otherValue }, ...]`. All configured primaryKey columns must be given a value.

## `UpsertOne`

Creates a query to update one row or create it if it does not already exists.

```js
import { upsertOne } from 'postgres-queries';

upsertOne({
    table,
    primaryKey,
    writableCols,
    returnCols,
    permanentFilters
})(row);
```

### Configuration

- [table](configuration.html#table)
- [primaryKey](configuration.html#primarykey)
- [writableCols](configuration.html#writablecols)
- [returnCols](configuration.html#returncols)
- [permanentFilters](configuration.html#permanentfilters)

### Parameters

The literal representing the rows to upsert

## `BatchUpsert`

Creates a query to update a batch row creating those that does not already exists.

```js
import { batchUpsert } from 'postgres-queries';

batchUpsert({
    table,
    primaryKey,
    writableCols,
    returnCols,
    permanentFilters
})(rows);
```

### Configuration

- [table](configuration.html#table)
- [primaryKey](configuration.html#primarykey)
- [writableCols](configuration.html#writablecols)
- [returnCols](configuration.html#returncols)
- [permanentFilters](configuration.html#permanentfilters)

### Parameters

The array of literal representing rows to upsert

## `SelectByOrderedIdentifiers`

Creates a query to select multiple row given an array of identifier. The result will keep the order of the identifier. Due to the nature of the query, this will only work for primaryKey composed of a single column.

```js
import { selectByOrderedIdentifiers } from 'postgres-queries';

selectByOrderedIdentifiers({
    table,
    primaryKey,
    returnCols
})(values);
```

### Configuration

- [table](configuration.html#table)
- [primaryKey](configuration.html#primarykey)
- [returnCols](configuration.html#returncols)

### Parameters

The array of identifier to retrieve. The array order will determine the result order.

## Transactions

postgres-queries exposes all the transactions commands:

- begin
- commit
- rollback
- savepoint

### Simple Transaction

```js
import Pool from 'postgres-queries/pool';

import { begin, commit, rollback } from 'postgres-queries';

const poll = new Pool();

const doRiskyChanges = async () => {
    const client = await = pool.connect();

    await client.namedQuery(begin());

    try {
        // Do risky changes

        await client.namedQuery(commit());
    } catch (error) {
        await client.namedQuery(rollback());
    }
} 
```

### Transaction With Savepoint

```js
import { begin, commit, savepoint, rollback } from 'postgres-queries';

const doRiskyChanges = async () => {
    const client = await = pool.connect();
    let savename = undefined;

    await client.namedQuery(begin());

    try {
        // Do risky change 1
        await client.namedQuery(savepoint('savepoint_1'));
        savename = 'savepoint_1';

        // Do risky change 2
        await client.namedQuery(savepoint('savepoint_2'));
        savename = 'savepoint_2';

        // Do risky change 3
        await client.namedQuery(commit());
    } catch (error) {
        await client.namedQuery(rollback(savename));
    }
} 
```
