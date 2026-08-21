---
nav:
  title: Troubleshoot scheduled task registration
  position: 50
---

# Troubleshoot scheduled task registration

A scheduled-task class only defines the task identity and schedule. Shopware must also discover and register it before it appears in the scheduled-task table.

For the current Core scaffolding generator, the generated scheduled-task example consists of the task class plus its `shopware.scheduled.task` service registration. The scaffolder does not generate a separate handler as part of that example. Do not copy an older handler pattern without checking the Core API used by your target Shopware version.

After adding or changing task registration, clear the container cache when needed and register scheduled tasks:

```bash
bin/console scheduled-task:register
bin/console scheduled-task:list
```

For a focused check:

```bash
bin/console scheduled-task:list | grep your-task-name
```

When appropriate, run one task directly:

```bash
bin/console scheduled-task:run-single your-task-name
```

```text
task class exists
    ↓
service has shopware.scheduled.task tag
    ↓
scheduled-task:register discovers it
    ↓
scheduled-task:list shows it
    ↓
runtime execution
```

If plugin activation reports that an already-active plugin is being skipped, do not assume that activation rebuilt the Symfony container. Cache/container refresh and scheduled-task registration are separate operations.
