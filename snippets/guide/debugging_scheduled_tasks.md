## Debugging scheduled tasks

You can directly run a single scheduled task without the queue. This is useful for debugging purposes or to have better control of when and which tasks are executed. You can use `bin/console scheduled-task:run-single <task-name>` to run a single task. Example:

```shell
bin/console scheduled-task:run-single log_entry.cleanup
```