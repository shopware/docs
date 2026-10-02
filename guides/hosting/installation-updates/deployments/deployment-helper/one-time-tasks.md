---
nav:
  title: One-Time Tasks
  position: 20

---

# One-Time Tasks

One-time tasks are scripts executed once per environment during deployment, then never again. They are useful for data fixes, initial setup, or one-off migrations that must not re-run on subsequent deployments.

Execution state is stored in the database (`one_time_tasks` table). A task is only marked complete after it succeeds; if it fails partway through, it will be retried on the next deployment.

## One-time task timing

A one-time task can run in two moments:

- `when: before`: Before `system:update:finish` (migrations). Useful when you need data updated before schema changes.
- `when: after`: (default) After extensions are managed and installed. This is the safest time for most tasks because extensions are ready.

### Example: data migration

```yaml
deployment:
  one-time-tasks:
    - id: migrate_old_custom_field_to_new
      when: after
      script: |
        %php.bin% bin/console custom:migrate-field-data
```

When deployed, this runs once. On the next deployment, DH checks the database and skips it. If you need to run it again, use `one-time-task:unmark`.

## Managing one-time tasks

Check execution history:

```bash
./vendor/bin/shopware-deployment-helper one-time-task:list
```

Returns a table showing which tasks ran, when, and their status.

Mark a task as complete without running it (useful after manual fixes):

```bash
./vendor/bin/shopware-deployment-helper one-time-task:mark <id>
```

Re-run a completed task (removes its completion mark):

```bash
./vendor/bin/shopware-deployment-helper one-time-task:unmark <id>
```

## One-time task timeout

By default, a task can run for up to 300 seconds (5 minutes). On large shops with slow queries or batch operations, you may hit this limit. If a task times out, it is marked incomplete and retried on the next deployment.

Increase the timeout via command option:

```bash
vendor/bin/shopware-deployment-helper run --timeout=900
```

Or set the environment variable:

```bash
export SHOPWARE_DEPLOYMENT_TIMEOUT=900
```

Disable timeout entirely (not recommended):

```bash
vendor/bin/shopware-deployment-helper run --timeout=null
```

## Best practices for one-time tasks

- **Keep them short**. If a task takes > 60s, consider moving it to a post-deploy webhook or scheduled task.
- **Fail loudly**. Exit with a non-zero code if something goes wrong, so the deployment fails and the task is retried.
- **Idempotent**. Make sure re-running the task is safe. If it's marked done, but you re-run it, it should not corrupt data.
- **Test in staging first**. Run the task in a staging deployment before pushing to production.
- **Remove completed tasks**. Once a task is done and verified safe, remove it from the config to keep the task list clean for future developers.

## One-time task partial failure and rollback

If a one-time task fails partway through, the database may be in a partial state. The task is not marked as complete, so it will retry on the next deployment.

Example: A task that migrates 100k customer records, fails at record 50k:

- First 50k records are updated (permanent in DB)
- Task fails
- Next deployment: retries the task from the beginning

To prevent duplicate updates or corruption, ensure your tasks are **idempotent**: rerunning them should be safe, even if they partially succeeded before. Use checks like:

```bash
# Check if migration already ran before doing work
if ./bin/console custom:check-migration-done; then
  echo "Migration already complete, skipping..."
  exit 0
fi

# Do the migration
./bin/console custom:migrate-data

# Mark it done
./bin/console custom:mark-migration-done
```

If the task fails halfway, the check in the next run will detect the partial state and either continue or skip safely.
