# Queries Builder

All query factories function takes an object as a parameter, containing the following keys:

- **table:** table name on which operate the query,
- **permanentFilters:** query filters provided to each underlying queries, as a plain object

## Count

Build a `COUNT(*)` query.

```js
import { countAll } from "postgres-queries-builder";

const countQuery = countAll({
  table: "user",
  permanentFilters: {
    active: 1
  }
});

countQuery({
  filter: {
    department: "HR"
  }
});

// SELECT COUNT(*) FROM user WHERE active = 1 AND departement = "HR"
```

The `countQuery` takes an extra object parameter whose keys are:

- **filter:** extra filter to apply to the query, as a plain object
