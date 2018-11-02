---
layout: default
title: "Documentation"
---
# postgres-queries

Utility to generate and execute postgresql queries with ease.

## Install

`npm install --save postgres-queries`

## Introduction
Creating query and executing them are two separate concerns. And thus postgres-queries is divided in two parts:
- The pool, that allows to connect to the postgres database and execute query.
- The query builders (insertOne, selectOne, etc..) that allows to generate sql, and the corresponding parameters.

## Pool
Extend [node-pg-pool](https://github.com/brianc/node-pg-pool)
Allow to connect to postgresql and execute query
It adds:
- namedQuery
- a link helper to link a query builder to the client.

### Creating a pool:
```js
import Pool from 'postgres-queries/pool';
const clientOptions = {
    user,
    password,
    database,
    host,
    port
};
const poolingOptions = {
    max, // Max number of clients to create (defaults to 10)
    idleTimeoutMillis // how long a client is allowed to remain idle before being closed (defaults to 30 000 ms)
}
const pool = new Pool(clientOptions, poolingOptions);
```

### Getting client with promise
```js
const pool = new pgPool();
pool.connect().then((client) => {
    // use the client
});

// async/await
(async () => {
    const pool = new pgPool();
    const client = await pool.connect();
})();
```

### client.namedQuery

The postgres-queries/pool allow you to execute named queries.

Normally to avoid sql injection, we use numeric placeholder for parameters

sql:
```js
client.query(
    'SELECT * FROM user WHERE id=$1 AND password=$2;',
    [id, password]
);
```

Then id and password will then be properly sanitized by the client.
But you have to keep track of the order, and this can become hard to work with.

postgres-queries/pool, support named query.
This allow us to name the parameter

```js
client.namedQuery({
    sql: 'SELECT * FROM user WHERE id=$id AND password=$password;',
    parameters: {
        id: 'id',
        password: 'password',
    },
})
```
### api
It takes a literal with the following keys

- sql: the sql string
- parameters: a literal `{ parameterName: parameterValue }` to inject in the sql.
- returnOne: Optional boolean, if set to true, returns only the first result instead of an array.


### client.link
Even if it's good to separate the code to build the query from the code that execute them. At one time, we want to link the twos.
`client.link` links a queryBuilder function to the client so that it executes the query directly.

```js
const selectOneById = client.link(selectOneByIdBuilder);
await selectOneById(1); // create and execute the query in one call.
```

## Query Builder
The main idea behind the query builder is to be able to just give a configuration object:
- the name of a table
- its primary key(s)
- the columns we want to read
- the columns we want to write

And get a function asking for the query parameter:
- id
- data object

And returning queryData that can be directly passed to the `client.namedQuery` method.

Some builder even allows to create several builder at once.

For example the crud query builder give us builders to create queries for all basic crud operations:

```js
// configuring the crud builder for the user table
const userQueries = crud({
    table: 'user',
    primaryKey: 'id',
    writableCols: ['name', 'firstname'],
});

// give us a collection of functions to query the user table :

userQueries.selectOne(1);
// returns:
{
    sql: 'SELECT * FROM user WHERE id=$id;',
    parameters: {
        id: 1,
    },
    returnOne: true,
}

userQueries.select({ name: 'doe' });
// returns:
{
    sql: 'SELECT * FROM user WHERE name=$name ORDER BY id ASC;',
    parameters: { name: 'doe' },
}

userQueries.insertOne({ name: 'doe', firstname: 'john' });
// returns:
{
    sql: (
`INSERT INTO user (name, firstname)
VALUES ($name, $firstname)
RETURNING *;`
    ),
    parameters: {
        name: 'doe',
        firstname: 'john',
    },
    returnOne: true,
}

userQueries.batchInsert([
    { name: 'doe', firstname: 'john' },
    { name: 'doe', firstname: 'jane' },
]);
// returns:
{
    sql: (
`INSERT INTO user(name, firstname)
VALUES ('doe', 'john'), ('doe', 'jane')
RETURNING *;`
    ),
    parameters: {
        name1: 'doe',
        firstname1: 'john',
        name2: 'doe',
        firstname2: 'jane',
    },
}

userQueries.updateOne(1, { firstname: 'johnny' });
// returns:
{
    sql: (
`UPDATE user SET firstname=$firstname
WHERE id=$id RETURNING *;`
    ),
    parameters: {
        id: 1,
        firstname: 'johnny',
    }
}

userQueries.removeOne(1);
// returns:
{
    sql: `DELETE FROM user WHERE id=$id RETURNING *;`,
    parameters: { id: 1 },
    returnOne: true,
}
//

userQueries.batchRemove([1, 2]);
// returns:
{
    sql: (
`DELETE FROM user
WHERE id IN ($id1, $id2)
RETURNING *;`
    ),
    parameters: { id1: 1, id2: 2 },
}

userQueries.countAll();
// returns:
{
    sql: `SELECT COUNT(*) FROM user;`,
}
```

And all this get properly sanitized. You cannot set value to column not in writableCols for example.

See the docs for more details
