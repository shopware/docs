---
nav:
  title: Data Handling / Data Abstraction Layer
  position: 10

---

# Data Handling/Data Abstraction Layer

The data handling, or the Data Abstraction Layer \(DAL\), can be an overwhelming topic. Yet, if you know the right start, it will be fairly easy to deal with.

Start with the step that matches what you want to do:

- Create or change database tables for a plugin - [Database migrations](../../database/database-migrations.md)
- Add a custom DAL entity for a plugin table - [Adding Custom Complex Data](add-custom-complex-data.md)
- Read data through repositories and criteria - [Reading Data](reading-data.md)
- Write data through repositories - [Writing Data](writing-data.md)
- React to DAL write or entity events - [Using Database Events](using-database-events.md)

For custom plugin data, create the database table first with a migration, then add the DAL entity definition that maps to that table.
