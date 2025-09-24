---
nav:
  title: Scheduled Task
  position: 30

---

# Scheduled task

## What are scheduled tasks?

Scheduled tasks are a way to schedule messages to the queue on time.
Shopware uses it to run cleanup tasks, update tasks, and other non-time critical tasks in the background.

## Default scheduled tasks

These tasks are registered by default:

| Name                                | Run interval (seconds) |
|-------------------------------------|------------------------|
| log_entry.cleanup                   | 86400                  |
| shopware.invalidate_cache           | 20                     |
| app_update                          | 86400                  |
| app_delete                          | 86400                  |
| version.cleanup                     | 86400                  |
| webhook_event_log.cleanup           | 86400                  |
| sales_channel_context.cleanup       | 86400                  |
| product_keyword_dictionary.cleanup  | 604800                 |
| product_download.media.cleanup      | 2628000                |
| delete_newsletter_recipient_task    | 86400                  |
| product_stream.mapping.update       | 86400                  |
| product_export_generate_task        | 60                     |
| import_export_file.cleanup          | 86400                  |
| shopware.sitemap_generate           | 86400                  |
| cart.cleanup                        | 86400                  |
| shopware.elasticsearch.create.alias | 300                    |

::: info
Some tasks like `shopware.elasticsearch.create.alias` and `shopware.invalidate_cache` are only running when necessary. Elasticsearch task only runs when an Elasticsearch server is configured and enabled.
:::

## Creating a scheduled task

<PageRef page="../../plugins/plugins/plugin-fundamentals/add-scheduled-task" />

::: info
The following commands or flags (--no-wait) are available starting with Shopware 6.5.5.0.
:::

## List all scheduled tasks

You can list all scheduled tasks with `bin/console scheduled-task:list` command.

## Scheduling a scheduled task

::: info
Available starting with Shopware 6.7.2.0.
:::

You can schedule a scheduled task with the command `bin/console scheduled-task:schedule`.

## Deactivating a scheduled task

::: info
Available starting with Shopware 6.7.2.0.
:::

You can deactivate a scheduled task with the command `bin/console scheduled-task:deactivate`.

## Running scheduled tasks

To run the scheduled tasks, you must set up a background worker like the [Message Queue](message-queue.md) and run the command `bin/console scheduled-task:run`. The command schedules all tasks to the queue and waits until a task needs to be scheduled. It consumes little CPU time or memory.

You can use the flag `--no-wait` and run the command from an operating system scheduler like cron. Check your scheduled task interval to determine the best interval to trigger the command. Example:

```bash
*/5 * * * * /usr/bin/php /var/www/html/bin/console scheduled-task:run --no-wait
```

## Using the symfony scheduler to run tasks

::: info
Running tasks with the symfony scheduler is available starting with Shopware 6.6
:::

::: warning
This feature is experimental.
:::

You can run scheduled tasks as part of your queue workers with the help of the symfony scheduler component.

``` bash
bin/console messenger:consume scheduler_shopware
```

On startup of this command reads the `scheduled_task` database table and applies the stored intervals, an entry in this table is optional.  In the event that these intervals are modified in the database, it is necessary to restart the command for the updated intervals to take effect.
To deactivate tasks, set status to `Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTaskDefinition::STATUS_INACTIVE` in this table, and restart the `consume` command.

<!--@include: @/docs/snippets/guide/debugging_scheduled_tasks.md-->
