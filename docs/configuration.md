---
layout: default
title: "Documentation"
---
# Query builder configuration

The [query builders](#builderList) possess the following configurations options

- [table](#table)
- [primaryKey](#primarykey)
- [writableCols](#writablecols)
- [searchabeCols](#searchablecols)
- [specificSorts](#specificsorts)
- [groupByCols](#groupbycols)
- [withQUery](#withQuery)

## `table`

Allow to set the name of the table for the query.

The table name can also be a join expression.

`user JOIN command ON user.id command.user_id`

Used by
- [selectOne](builderList.html/#selectOne)
- [select](builderList.html/#select)
- [count](builderList.html/#count)
- [selectByOrderedIdentifiers](builderList.html/#selectByOrderedIdentifiers)
- [upsertOne](builderList.html/#upsertOne)
- [batchInsert](builderList.html/#batchInsert)
- [BatchUpsert](builderList.html/#BatchUpsert)
- [insertOne](builderList.html/#insertOne)
- [remove](builderList.html/#remove)
- [batchRemove](builderList.html/#batchRemove)
- [removeOne](builderList.html/#removeOne)
- [update](builderList.html/#update)
- [updateOne](builderList.html/#updateOne)
- [crud](builderList.html/#crud)

## `primaryKey`

Specify the primary key for the query. The primary key is one or more column that identifies a single row in the sql table.

Accept either a string for a single id (`'id'`), or an array of string for a composite primaryKey (`['user_id', 'command_id']`)

Used by
- [selectOne](builderList.html/#selectOne)
- [select](builderList.html/#select)
- [selectByOrderedIdentifiers](builderList.html/#selectByOrderedIdentifiers)
- [upsertOne](builderList.html/#upsertOne)
- [batchInsert](builderList.html/#batchInsert)
- [BatchUpsert](builderList.html/#BatchUpsert)
- [insertOne](builderList.html/#insertOne)
- [remove](builderList.html/#remove)
- [batchRemove](builderList.html/#batchRemove)
- [removeOne](builderList.html/#removeOne)
- [update](builderList.html/#update)
- [updateOne](builderList.html/#updateOne)
- [crud](builderList.html/#crud)

## `writableCols`

The list of columns that can be set in insert and update queries.
Any key not in this array will be removed from the filter parameter.

```js
['name', 'firstname']
```

Used by
- [upsertOne](builderList.html/#upsertOne)
- [batchInsert](builderList.html/#batchInsert)
- [BatchUpsert](builderList.html/#BatchUpsert)
- [insertOne](builderList.html/#insertOne)
- [update](builderList.html/#update)
- [updateOne](builderList.html/#updateOne)
- [crud](builderList.html/#crud)

## `searchableCols`

The list of column that can be searched in select query.

Used by
- [select](builderList.html/#select)
- [crud](builderList.html/#crud)

## `specificSorts`

Allow to specify specific sorts for select.
A specific sorts is used to tell the builder how to sort an enumerable column.

For example imagine a level column that can have the values of `novice`, `expert` or `master`.
In order to be able to sort these values, we need to tell sql which value is greater than the other.
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

Obviously this will be only used when sorting by the concerned column see [select](builderList.html/#select)

Used by
- [select](builderList.html/#select)
- [crud](builderList.html/#crud)

## `groupByCols`

An optional array of columns name by which to group the result in select query.

Used by
- [select](builderList.html/#select)
- [crud](builderList.html/#crud)

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
- [select](builderList.html/#select)
- [crud](builderList.html/#crud)


## permanentFilter

Allow to set permanent filter that will add filter on every query.
Useful to hide som
