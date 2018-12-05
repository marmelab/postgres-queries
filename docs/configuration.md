---
layout: default
title: "Builder Configuration"
---
# Query builder configuration

The [query builders](#builderList) have the following configurations options

- [table](#table)
- [primaryKey](#primarykey)
- [returnCols](#returncols)
- [writableCols](#writablecols)
- [searchableCols](#searchablecols)
- [filterCols](#filtercols)
- [specificSorts](#specificsorts)
- [groupByCols](#groupbycols)
- [withQuery](#withquery)
- [permanentFilter](#permanentfilter)

## `table`

Allow to set the name of the table for the query.

The table name can also be a join expression.

`user JOIN command ON user.id command.user_id`

Used by
- [selectOne](queryBuilder.html#selectone)
- [select](queryBuilder.html#select)
- [count](queryBuilder.html#count)
- [selectByOrderedIdentifiers](queryBuilder.html#selectbyorderedidentifiers)
- [upsertOne](queryBuilder.html#upsertone)
- [batchInsert](queryBuilder.html#batchinsert)
- [BatchUpsert](queryBuilder.html#batchupsert)
- [insertOne](queryBuilder.html#insertone)
- [remove](queryBuilder.html#remove)
- [batchRemove](queryBuilder.html#batchremove)
- [removeOne](queryBuilder.html#removeone)
- [update](queryBuilder.html#update)
- [updateOne](queryBuilder.html#updateone)
- [crud](queryBuilder.html#crud)

## `primaryKey`

Specify the primary key for the query. The primary key is one or more column that identifies a single row in the sql table.

Accept either a string for a single id (`'id'`), or an array of string for a composite primaryKey (`['user_id', 'command_id']`)

Used by
- [selectOne](queryBuilder.html#selectone)
- [select](queryBuilder.html#select)
- [selectByOrderedIdentifiers](queryBuilder.html#selectbyorderedidentifiers)
- [upsertOne](queryBuilder.html#upsertone)
- [batchInsert](queryBuilder.html#batchinsert)
- [BatchUpsert](queryBuilder.html#batchupsert)
- [insertOne](queryBuilder.html#insertone)
- [remove](queryBuilder.html#remove)
- [batchRemove](queryBuilder.html#batchremove)
- [removeOne](queryBuilder.html#removeone)
- [update](queryBuilder.html#update)
- [updateOne](queryBuilder.html#updateone)
- [crud](queryBuilder.html#crud)

## `returnCols`

The list of columns that will be returned from query result.

Used By
- [selectOne](queryBuilder.html#selectone)
- [select](queryBuilder.html#select)
- [selectByOrderedIdentifiers](queryBuilder.html#selectbyorderedidentifiers)
- [upsertOne](queryBuilder.html#upsertone)
- [batchInsert](queryBuilder.html#batchinsert)
- [BatchUpsert](queryBuilder.html#batchupsert)
- [insertOne](queryBuilder.html#insertone)
- [remove](queryBuilder.html#remove)
- [batchRemove](queryBuilder.html#batchremove)
- [removeOne](queryBuilder.html#removeone)
- [update](queryBuilder.html#update)
- [updateOne](queryBuilder.html#updateone)
- [crud](queryBuilder.html#crud)


## `writableCols`

The list of columns that can be set in insert and update queries.
Any key not specified in this parameter will be removed from the filter.

```js
['name', 'firstname']
```

Used by
- [upsertOne](queryBuilder.html#upsertone)
- [batchInsert](queryBuilder.html#batchinsert)
- [BatchUpsert](queryBuilder.html#batchupsert)
- [insertOne](queryBuilder.html#insertone)
- [update](queryBuilder.html#update)
- [updateOne](queryBuilder.html#updateone)
- [crud](queryBuilder.html#crud)

## `searchableCols`

The list of column that can be searched in select query.

Used by
- [select](queryBuilder.html#select)
- [crud](queryBuilder.html#crud)

## `filterCols`

The list of columns that can be used to filter the rows

Used By
- [Remove](queryBuilder.html#remove)
- [Update](queryBuilder.html#update)

## `specificSorts`

Allow to specify specific sorts for select.
A specific sorts is used to tell the builder how to sort an enumerable column.

For example say we have a level column that can have the values of `novice`, `expert` or `master`.
In order to sort these values, we need to tell sql which value is greater than the other.
In our case `master` > `expert` > `novice`.
So we pass
```js
{
    specificSorts: {
        level: ['master', 'expert', 'novice'],
    }
}
```
So that the builder can know how to sort the level column.

If you are interrested, the resulting sql for the order level part will be:

```sql
ORDER BY CASE level
    WHEN 'master' THEN 1
    WHEN 'expert' THEN 2
    WHEN 'novice' THEN 3
END
```

Obviously this will be only used when sorting by the concerned column see [select](queryBuilder.html#select)

Used by
- [select](queryBuilder.html#select)
- [crud](queryBuilder.html#crud)

## `groupByCols`

An optional array of columns name by which to group the result in select query.

Used by
- [select](queryBuilder.html#select)
- [crud](queryBuilder.html#crud)

## `withQuery`

An optional boolean to modify the select querybuilder to use a [WITH](https://www.postgresql.org/docs/9.1/static/queries-with.html) statement on top of the SELECT.

```sql
WITH result AS (
SELECT name, firstname FROM user JOIN command ON user.id table2.id
) SELECT * FROM result ORDER BY id ASC
```

This can be useful when operating on joined table and or computed field as it allows to sort and filter on joined column, and or computed value.

Note: if the builder detect join in the table name it will automatically use a WITH statement.
You can set withQuery to false to deactivate this.

Used by
- [select](queryBuilder.html#select)
- [crud](queryBuilder.html#crud)


## permanentFilters

Used by
- [selectOne](queryBuilder.html#selectone)
- [select](queryBuilder.html#select)
- [count](queryBuilder.html#count)
- [upsertOne](queryBuilder.html#upsertone)
- [BatchUpsert](queryBuilder.html#batchupsert)
- [remove](queryBuilder.html#remove)
- [batchRemove](queryBuilder.html#batchremove)
- [removeOne](queryBuilder.html#removeone)
- [update](queryBuilder.html#update)
- [updateOne](queryBuilder.html#updateone)
- [crud](queryBuilder.html#crud)

Allow to set permanent filter that will add filter on every query.
Useful to hide some document based on a filter.
e.g. hide all user with role admin.

## returnOne

Optional, if set to true, returns only the first result instead of an array.

Used by
- [select](queryBuilder.html#select)
- [remove](queryBuilder.html#remove)
- [update](queryBuilder.html#update)
