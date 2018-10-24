# postgres-queries

Query builder for PostgreSQL in Node.js, built for async

## Install

`npm install --save postgres-queries`

## Introduction
The library can be divided in two parts:
- The query builders (insertOne, selectOne, etc..) that allows to generate sql, and the corresponding parameters.
- The pool, that allows to connect to the postgres database and execute query.



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
```js
client.query({
    sql: 'SELECT $name::text as name',
    parameters: { name: 'world' }
}) // query return a promise
.then((result) => {
    // result contain directly the row
    console.log(`Hello ${result[0].name}`);
});

// It work with asyn/await
(async() => {
    const pool = new PgPool();
    const result = await pool.query({
        sql: 'SELECT $name::text as name',
        parameters: { name: 'world' }
    });

    console.log(`Hello ${result[0].name}`);
})()
```

### client.link
Take a query or a literal of query and returns a function that takes the query parameter and executes it

```js
const query = insertOneQuery('table', ['col1', 'col2']);

const insertOne = client.link(query);

yield insertOne({ col1: 'val1', col2: 'val2' });

// or
const queries = crudQueries(table, ['col1', 'col2'], ['col1']);

const crud = client.link(queries);

yield crud.insertOne({ col1: 'val1', col2: 'val2' });
```
