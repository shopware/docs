---
nav:
  title: Troubleshooting
  position: 30

---

# Troubleshooting

Address issues during migration with the following steps:

- **Check Errors**: Review the `b2b_components_migration_errors` table for detailed error logs if the status is `Complete with error`.
- **New Records**: If `Has new records` appears, re-run the migration to include new records.
- **Rollback**: Use the following command to revert changes if necessary:

  ```bash
  bin/console b2b:migrate:rollback
  ```
  
::: warning
Rolling back will remove migrated data from B2B Commercial.
:::
