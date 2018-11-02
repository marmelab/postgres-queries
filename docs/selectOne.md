---
layout: default
title: "Documentation"
---
## selectOne

Allows to create a select query to retrieve one row based on a primaryKey.

```js
import { selectOne } from 'postgres-queries/builder';
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

- table: the table name
- primaryKey: One or more columns representing the primary key. Accept either an array or a single value. (default: `id`)
- returnCols: list of columns retrieved by the query
- permanentFilters: List of filters applied by default, e. g. for a soft delete with permanentFilters as `{ deleted_at: null}`

### Parameters

A literal in the form of:

```js
{
    id1: value,
    id2: value,
    ...
}
```

Any key not present in primaryKey will be ignored.


