---
nav:
  title: Scheduled task lifecycle
  position: 105
---

# Scheduled task lifecycle

A scheduled task must be discovered, registered, persisted, scheduled, and eventually executed through Shopware's task runner and message queue.

For the broader implementation, including handlers and execution, see [Add Scheduled Task](./add-scheduled-task.md).

The current Core scaffolding example for a scheduled task creates the task class and its `shopware.scheduled.task` registration. Treat that focused scaffold separately from the complete application pattern described in the implementation guide, and verify conventions against the Shopware version you target.

## Registration lifecycle

```text
task class → services.php/tag → scheduled-task:register → scheduled-task:list → persisted schedule → runner/message queue → execution
```

Useful discovery checks are:

```bash
bin/console scheduled-task:register
bin/console scheduled-task:list | grep your-task-name
```

## Troubleshooting by boundary

```text
class-not-found → code / namespace / autoloading
task absent from scheduled-task:list → service registration / discovery
task registered but not executing → schedule state / runner / message queue / handler
```

Changing service registration can require a cache/container refresh. Re-running plugin activation for an already-active plugin does not by itself prove that the Symfony container was rebuilt.
