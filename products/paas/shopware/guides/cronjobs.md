---
nav:
  title: Manage Cron Jobs
  position: 80
---

# Manage Cron Jobs

Cron Jobs let you schedule recurring tasks for your application, such as cache warming, search index updates, or data exports. They are defined in your `application.yaml` and managed via the PaaS CLI.

::: info
The PaaS native cron job feature does **not** replace Shopware's built-in Scheduled Tasks. It is an addition to them and does not interact with the Scheduled Task system in any way.
:::

## Defining Cron Jobs in application.yaml

Cron Jobs are declared under the `cronJobs` key in your `application.yaml`. They are automatically created, updated, or removed whenever you deploy a new version of your configuration.

::: warning
Cron Jobs are **disabled by default**. After deploying, you must explicitly enable them via the CLI before they will run. See [Enable or disable Cron Jobs](#enable-or-disable-cron-jobs).
:::

```yaml
app:
  php:
    version: "8.3"
  environment_variables: []
services:
  mysql:
    version: "8.0"
  opensearch:
    enabled: false
cronJobs:
  - name: reindex-elasticsearch
    schedule: "0 3 * * *"
    command: "bin/console es:index"

  - name: warmup-cache
    schedule: "*/30 * * * *"
    command: "bin/console cache:warmup"
```

### Field Reference

| Field | Required | Default | Description |
|---|---|---|---|
| `name` | Yes | — | Unique identifier for this cron job |
| `schedule` | Yes | — | Cron expression (5-field standard format) |
| `command` | Yes | — | Shell command to run |
| `timezone` | No | `UTC` | IANA timezone for the schedule |

### Name Format

The `name` field must follow these rules:

- Only **lowercase** letters (`a-z`), digits (`0-9`), and hyphens (`-`)
- Must **start and end** with a letter or digit (not a hyphen)
- Minimum length of 2 characters

**Valid examples:** `reindex-elasticsearch`, `daily-cleanup`, `warmup-cache`
**Invalid examples:** `My-Job` (uppercase), `-my-job` (starts with hyphen), `my_job` (underscore)

### Schedule Format

The `schedule` field uses the standard 5-field cron format:

```text
┌─────────── minute (0–59)
│ ┌───────── hour (0–23)
│ │ ┌─────── day of month (1–31)
│ │ │ ┌───── month (1–12)
│ │ │ │ ┌─── day of week (0–6, Sunday = 0)
│ │ │ │ │
* * * * *
```

**Common examples:**

| Schedule | Description |
|---|---|
| `0 3 * * *` | Every day at 03:00 |
| `*/15 * * * *` | Every 15 minutes |
| `0 0 * * 0` | Every Sunday at midnight |
| `30 8 1 * *` | First day of the month at 08:30 |

### Timezones

By default, all schedules run in **UTC**. Use the `timezone` field to run a job in a different timezone. Any [IANA timezone](https://www.iana.org/time-zones) identifier is valid.

```yaml
cronJobs:
  - name: midnight-report
    schedule: "0 0 * * *"
    command: "bin/console report:generate"
    # Runs at midnight Berlin time
    timezone: Europe/Berlin
```

::: warning
The value `Local` is explicitly not allowed as a timezone. Always use a specific IANA identifier such as `Europe/Berlin` or `America/New_York`.
:::

## Managing Cron Jobs via the CLI

### List all Cron Jobs

```bash
sw-paas application cronjob list
```

This shows all cron jobs for your application with their current status:

```text
┌──────────────────────┬───────────────────────┬─────────────────┬──────────────────────┬──────────┬─────────┬──────────────────────┬───────────┐
│ Id                   │ Name                  │ Schedule        │ Command              │ Timezone │ Enabled │ Last Run             │ Last ...  │
├──────────────────────┼───────────────────────┼─────────────────┼──────────────────────┼──────────┼─────────┼──────────────────────┼───────────┤
│ 8fc7d8a3-...         │ reindex-elasticsearch │ 0 3 * * *       │ bin/console es:index │ UTC      │ true    │ 2024-03-12 03:00:00  │ SUCCEEDED │
│ 2b9e6f1d-...         │ warmup-cache          │ */30 * * * *    │ bin/console cache:.. │ UTC      │ false   │ 2024-03-11 14:30:00  │ FAILED    │
└──────────────────────┴───────────────────────┴─────────────────┴──────────────────────┴──────────┴─────────┴──────────────────────┴───────────┘
```

To output as JSON:

```bash
sw-paas application cronjob list -o json
```

### Get details of a single Cron Job

```bash
sw-paas application cronjob get --id <cronjob-id>
```

If you omit `--id`, the CLI opens an interactive selection prompt.

```text
┌─────────────┬──────────────────────────┐
│ Property    │ Value                    │
├─────────────┼──────────────────────────┤
│ ID          │ 8fc7d8a3-...             │
│ Name        │ reindex-elasticsearch    │
│ Schedule    │ 0 3 * * *                │
│ Command     │ bin/console es:index     │
│ Timezone    │ UTC                      │
│ Enabled     │ true                     │
│ Last Run    │ 2024-03-12 03:00:00      │
│ Last Status │ SUCCEEDED                │
└─────────────┴──────────────────────────┘
```

### Enable or disable Cron Jobs

After making changes to the enabled state of a Cron Job via the CLI, a new deployment is required for the change to take effect.

::: warning
Changes made with `cronjob update` are only applied after a new deployment of your application. Without redeploying, the scheduler will continue to use the previous state.
:::

**Interactive mode** — toggle any job via a menu:

```bash
sw-paas application cronjob update
```

Controls: `↑/↓` navigate · `space` toggle · `a` enable all · `d` disable all · `enter` confirm · `q` / `esc` abort

**Enable or disable a specific job:**

```bash
sw-paas application cronjob update --id <cronjob-id> --enable
sw-paas application cronjob update --id <cronjob-id> --disable
```

**Enable or disable all jobs at once:**

```bash
sw-paas application cronjob update --enable --all
sw-paas application cronjob update --disable --all
```

::: info
`--enable` and `--disable` are mutually exclusive. `--all` and `--id` are mutually exclusive.
:::

### View execution history

The history shows every execution run with its status and timestamps. History is retained for **61 days**.

```bash
sw-paas application cronjob history list
```

**Filter by date or time range:**

```bash
# All runs on a specific day
sw-paas application cronjob history list --date 2024-01-15

# Runs within a time range
sw-paas application cronjob history list --from "2024-01-15 08:00" --to "2024-01-15 18:00"
```

**Filter by job or run:**

```bash
# History for a specific cron job
sw-paas application cronjob history list --cronjob-id <cronjob-id>

# Details for a specific run
sw-paas application cronjob history list --run-id <run-id>
```

**Pagination:**

```bash
sw-paas application cronjob history list --limit 100 --offset 50
```

::: info
`--date` cannot be combined with `--from` or `--to`.
:::

**Example output:**

```text
┌────────────────┬───────────┬─────────────────────┬──────────┐
│ Run ID         │ Status    │ Timestamp           │ Timezone │
├────────────────┼───────────┼─────────────────────┼──────────┤
│ run-abc123     │ RUNNING   │ 2024-03-12 03:00:00 │ UTC      │
│                │ SUCCEEDED │ 2024-03-12 03:00:45 │ UTC      │
│                │           │                     │          │
│ run-def456     │ RUNNING   │ 2024-03-11 03:00:00 │ UTC      │
│                │ FAILED    │ 2024-03-11 03:00:10 │ UTC      │
└────────────────┴───────────┴─────────────────────┴──────────┘
```

### Logs

The full output of each Cron Job execution is available in Grafana. Use the following label filter to find the relevant log entries:

```text
component: cronjob
```

For details on how to access and query logs in Grafana, see [Logs](../monitoring/logs).

## Specifying Organization, Project, and Application

All commands accept optional flags to target a specific resource. If omitted, the CLI will auto-detect from your git remote or prompt you interactively.

```bash
sw-paas application cronjob list \
  --organization-id <org-id> \
  --project-id <project-id> \
  --application-id <app-id>
```

The short alias `cron` works for all commands:

```bash
sw-paas application cron list
sw-paas application cron history list
```
