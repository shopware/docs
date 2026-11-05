---
nav:
  title: Queue health during large jobs
  position: 45
---

# Queue health during large jobs

Some jobs put thousands of messages into the message queue at once. A full OpenSearch reindex with `bin/console dal:refresh:index --use-queue`, a large import or export, or a bulk product update all work this way. The command returns immediately, and the worker processes the messages in the background. From the outside this can look like a stalled deployment or a broken search when the queue is simply still draining.

This page describes what to watch while such a job runs, what normal looks like, and when it is worth opening a ticket.

## Before you start the job

- Note the time you ran the command. Everything below is read against that start time.
- Expect search to return no results until the queue has drained. The deployment reports success before the index is built, see [How to set up OpenSearch](../guides/opensearch.md#post-enablement-actions).
- Expect the worker to need more resources than usual. Indexing messages are memory-heavy.

## Where to look

Open Grafana with `sw-paas open grafana` and select the **Application Resources** dashboard. Set the **deployment** variable to the worker deployment. Set the time range to cover the moment you started the job.

## What to watch

The **Message Queues** row is the primary signal. The rest of the dashboard tells you why the queue is or is not draining.

| Panel                                                | Healthy during a large job                                                                              | Needs attention                                                                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Messages per Queue, Queue Depth                      | The `async` queue jumps when the job starts, then falls steadily towards zero. Short spikes are normal. | The queue plateaus or keeps growing for more than a few minutes while workers are running. The `failed` queue is anything above zero.               |
| Available Replicas per Component                     | Worker replicas rise with the queue depth and fall back to zero once it is empty.                       | Worker replicas stay at zero while the queue is above zero.                                                                                         |
| Pods & Autoscaling                                   | Running pods are below the dashed plan maximum.                                                         | Running pods sit on the dashed line for the whole job. The plan limit is the bottleneck, not the application.                                       |
| Component Issues                                     | `All components: running`, or `scaling` while pods are added or removed.                                | `error`, `not-found` or `unknown` for the worker.                                                                                                   |
| Memory Usage (of limits), Memory vs Limits (per pod) | Below 100% of the limit.                                                                                | Pods approaching 100%. They are about to be killed.                                                                                                 |
| OOM-Killed Containers (24h), Restarts (24h)          | Zero.                                                                                                   | Anything above zero. A killed worker loses the message it was processing, the message is retried, and the queue stalls or grows while this repeats. |

:::info
A queue that drains slowly but steadily is not an incident. On a large catalog a full reindex takes a while, and the worker is doing what it is supposed to do. A queue that stops draining while the worker is restarting or pinned at the plan maximum is.
:::

## Check the dependencies

The queue itself lives in Valkey, and indexing reads heavily from the database. If the worker looks healthy but the queue is not moving, check these next.

**Valkey dashboard.** Select the worker instance. On **Memory Used**, the dashed line is the configured `maxmemory`. On **Evicted / Expired Keys**, evictions on the worker instance mean the queue is rejecting writes, because the worker instance uses the `noeviction` policy. Either one means the queue itself is full.

**Database dashboard.** Watch **ACU Utilization** and **Database Connections**. Sustained utilization near the configured maximum during a reindex slows every message down and also affects storefront requests.

**PHP-FPM dashboard.** Select the `storefront` component. **Pool Utilization** near 100% while the job runs means the reindex is starving the storefront, and customers will notice slow pages before the queue is done.

## Read the worker logs

Stream the worker logs from the CLI while the job runs:

```bash
sw-paas application logs --component worker --follow --since 15m
```

Or open the **Logs** dashboard in Grafana, set **component** to `worker` and **level** to `ERROR`. Look for memory exhausted errors, database timeouts, and connection errors to OpenSearch. One of these repeating on every retry explains a `failed` queue that keeps growing.

## Check from inside the application

Open an exec session with `sw-paas exec --new` and run:

```bash
bin/console messenger:stats
bin/console messenger:failed:show
```

The first command shows pending messages per transport and confirms what the dashboard shows. The second lists failed messages with their error, which is the quickest way to find the root cause of a growing `failed` queue.

## When to open a ticket

Open a ticket when one of the following is true:

- The worker is pinned at the plan maximum for the whole job and the queue is not draining fast enough for your needs. This is a sizing conversation.
- Workers are OOM-killed or restarting repeatedly. The memory limit does not fit the workload.
- Valkey memory on the worker instance has reached `maxmemory` or shows evictions.
- The worker shows `error`, `not-found` or `unknown` under Component Issues.

Include the start time of the job, the command you ran, a screenshot of **Queue Depth** and **Pods & Autoscaling** covering the job, and the output of `messenger:failed:show` if the `failed` queue is above zero.

:::warning
Do not open a ticket for a queue that is still draining. Check the table above first. In most cases the dashboard already tells you whether the worker is the bottleneck or the plan is.
:::

## Reduce the impact next time

Long-running messages such as indexing delay time-critical messages such as order confirmation emails while they share the `async` queue. Route them to a separate transport so that mail and other short messages keep flowing during a reindex. See [Split message queues](../guides/message-queues.md).
