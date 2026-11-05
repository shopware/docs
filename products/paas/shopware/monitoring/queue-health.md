---
nav:
  title: Queue health during large jobs
  position: 45
---

# Queue health during large jobs

Shopware hands slow work to a message queue instead of doing it during a request. The worker is the component that processes that queue in the background. Some jobs put thousands of messages into the queue at once. A full reindex with `bin/console dal:refresh:index --use-queue`, which also rebuilds the OpenSearch index when OpenSearch is enabled, is the most common one. Large imports and bulk updates behave the same way. The command returns as soon as the messages are queued, long before the work is done. From the outside this can look like a broken shop while the queue is simply still draining.

This page describes how the worker behaves, what to watch while such a job runs, and when to open a ticket.

## How the worker processes the queue

Shopware uses three queues, called transports. Each one has its own worker. In Grafana, the **deployment** variable lists them under these names:

| Transport      | Stored in | Worker deployment                                | Used for                                                          |
| -------------- | --------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| `async`        | Valkey    | `<application>-store-worker-async`               | Indexing, mails, and everything else processed asynchronously     |
| `low_priority` | Database  | `<application>-store-worker-low-priority-<hash>` | Messages Shopware marks as low priority                           |
| `failed`       | Database  | `<application>-store-worker-failed`              | Messages that failed after all retries. This worker retries them. |

Each worker runs as one or more pods, and the number of pods follows the number of messages waiting in its queue:

- With an empty queue the worker has zero pods. A pod starts within seconds of the first message.
- One pod is added for roughly every 300 waiting messages, up to the maximum your plan allows.
- When the queue is empty, the pods are removed after a short cooldown.

:::info
Indexing messages are batches. One product indexing message covers 50 products, so a catalog of a few thousand products is only a few dozen messages and drains within minutes on one pod. The scheduled task runner also queues a few messages every five minutes, so a worker pod appearing briefly every five minutes is expected.
:::

## Start the job

Run the reindex as a command in a dedicated container, so you can follow its output afterwards. The first command prints the command ID that the second one needs:

```bash
sw-paas command create --script 'bin/console dal:refresh:index --use-queue'
sw-paas command logs --command-id <command-id>
```

Note the time you started it. The command only queues the work, so it reports `SUCCEEDED` long before indexing is done.

## Where to look

Run `sw-paas open grafana` to get the Grafana URL and credentials, then open the **Application Resources** dashboard with a time range that covers the job start. The **Message Queues** row shows all three queues for the whole application. For the pod-level panels, set **deployment** to the `async` worker, since that is where indexing goes.

| Panel                                       | Healthy during a large job                                                                                                | Needs attention                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Messages per Queue, Queue Depth             | `async` jumps when the job starts, then falls steadily towards zero.                                                      | `async` plateaus or grows for several minutes while worker pods are running. `failed` is growing.              |
| Available Replicas per Component            | Worker replicas rise after the queue fills and drop to zero when it is empty.                                             | Worker replicas stay at zero while `async` is above zero for more than a minute.                               |
| Pods & Autoscaling                          | Running pods are below the dashed plan maximum, or touch it briefly.                                                      | Running pods sit on the dashed line for the whole job and the queue drains slowly. The plan is the limit.      |
| Component Issues                            | `All components: running`, or `scaling` while pods change.                                                                | `error`, `not-found` or `unknown` for the worker.                                                              |
| Memory Usage (of limits)                    | Below the limit. Memory grows during indexing and drops when the worker process restarts itself, which it does regularly. | Pods approaching 100% of the limit.                                                                            |
| OOM-Killed Containers (24h), Restarts (24h) | Zero. The worker process restarting itself does not count here.                                                           | Above zero. A killed worker loses its current message, it is retried, and the queue stalls while this repeats. |

:::info
Metrics are collected once a minute. On a small catalog the reindex can finish between two samples, so the dashboard may show the worker pod but never the queue. If the queue is visible and shrinking, the job is progressing.
:::

## Check the dependencies

If the worker looks healthy but `async` is not moving, check what the worker depends on.

**Valkey dashboard.** Valkey is the Redis-compatible store the platform provides. The `async` queue lives in the worker Valkey instance, which also stores carts. Select it. On **Memory Used**, the dashed line is `maxmemory`. The instance uses the `noeviction` policy, so at the limit it rejects writes instead of evicting keys, and the eviction counter stays flat. Check memory usage together with Valkey OOM or write errors in the worker and storefront logs. Evictions on **Evicted / Expired Keys** mean another instance or policy is selected. Key expiration is normal.

**Database dashboard.** Indexing reads heavily from the database. **ACU Utilization** shows how much of your plan's database capacity is in use. Sustained values near the maximum slow every message and affect storefront requests too.

**PHP-FPM dashboard.** Select the `storefront` component. The storefront scales on **Pool Utilization**, so a value that stays high during the job means the reindex is competing with customer traffic.

## Read the worker logs

```bash
sw-paas application logs --component worker --follow --since 15m
```

A healthy run is a steady sequence of `Received message`, `handled successfully` and OpenSearch `Request Success` lines. When the queue stalls, filter for errors:

```bash
sw-paas application logs --component worker --since 15m --query '{component="worker"} |= "ERROR"'
```

The **Logs** dashboard in Grafana offers the same filter with **component** set to `worker` and **level** to `ERROR`. Memory exhausted errors, database timeouts, or OpenSearch connection errors repeating on every retry explain a growing `failed` queue.

## Check from inside the application

Open a terminal session in your application with `sw-paas exec --new`, see [Executing Commands](../fundamentals/applications.md#executing-commands), and run:

```bash
bin/console messenger:stats
bin/console messenger:failed:show
```

The first shows pending messages per transport and matches the dashboard. The second lists failed messages with their error, which is the fastest way to the root cause of a growing `failed` queue.

## Is the search index ready

On a shop that already has a working index, a reindex does not make search return no results. The old index keeps serving until Shopware switches the alias to the new one. Empty results during a reindex are a search failure, not a draining queue. Only when OpenSearch was just enabled and no index exists yet does search stay empty until the initial indexing finishes, see [How to set up OpenSearch](../guides/opensearch.md#post-enablement-actions).

To check progress, run `bin/console es:status` in an exec session:

```text
+-----------------+-----------+
| Name            | Status    |
+-----------------+-----------+
| Cluster Status  | green     |
| Available Nodes | 6         |
| Indexing        | completed |
+-----------------+-----------+
```

`Indexing: completed` on its own does not mean search is ready. The status comes from the indexing task record, which the worker creates, so the command shows `completed` until the worker has picked up the job. It also shows `completed` once all documents are written but before the alias has switched. In that case the output ends with a warning that the alias will swap at the end of the indexing process.

The swap is done by a Shopware scheduled task, and the platform runs scheduled tasks every five minutes, so the warning should disappear within about ten minutes after the queue drains. If it persists, check the **Scheduled Tasks** row on the Application Resources dashboard and the runner's output with `sw-paas application logs --component scheduled-task`. Declare the index ready when the queue is empty, the worker logged no errors, no alias warning is printed, and storefront search returns results.

## When to open a ticket

Open a [support ticket](../faq.md#when-should-i-use-slack-and-when-should-i-open-a-ticket) when one of the following is true:

- The worker is pinned at the plan maximum for the whole job and the queue drains too slowly for your needs. This is a sizing conversation.
- Worker pods are OOM-killed or restarted repeatedly.
- Valkey memory on the worker instance has reached `maxmemory`, or the logs show Valkey OOM or write errors.
- The worker shows `error`, `not-found` or `unknown` under Component Issues.

Include the start time, the command you ran, a screenshot of **Queue Depth** and **Pods & Autoscaling** covering the job, and the output of `messenger:failed:show` if the `failed` queue is above zero.

:::warning
A queue that drains steadily without errors or resource pressure usually does not require a ticket. If any of the criteria above apply, open a ticket even if the queue is still draining.
:::

## Reduce the impact next time

Long-running messages such as indexing delay time-critical messages such as order confirmation emails while they share the `async` queue. Route them to a separate transport so short messages keep flowing during a reindex. See [Split message queues](../guides/message-queues.md).
