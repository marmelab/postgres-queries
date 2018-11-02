---
layout: default
title: "Documentation"
---
# Pool
Extend [node-pg-pool](https://github.com/brianc/node-pg-pool)
Allow to [connect](#connection) to postgresql and execute query.

It adds:
- [namedQuery](#client.namedQuery)
- [link](#client.link)

## `Connection`
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

## `client.namedQuery`

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


## `client.link`
Even if it's good to separate the code to build the query from the code that execute them. At one time, we want to link the two.
`client.link` links a queryBuilder function to the client so that it executes the query directly.

```js
const selectOneById = client.link(selectOneById);
await selectOneById(1); // create and execute the query in one call.
```

client.link takes either a single configured queryBuilder, or a literal of several of them.


