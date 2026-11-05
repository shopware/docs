---
nav:
  title: Queue health during large jobs
  position: 45
---

# Queue health during large jobs

Some jobs put thousands of messages into the message queue at once. A full reindex with `bin/console dal:refresh:index --use-queue`, which also rebuilds the OpenSearch index when OpenSearch is enabled, is the most common one. Large imports and bulk product updates behave the same way. The command returns as soon as the messages are queued, and the worker processes them in the background. From the outside this can look like a broken search or a stalled deployment while the queue is simply still draining.

This page describes how the worker behaves on Shopware PaaS Native, what to watch while such a job runs, and when it is worth opening a ticket.

## How the worker processes the queue

Shopware uses three message transports, and each one has its own worker deployment:

| Transport      | Stored in | Worker deployment                                | Used for                                                              |
| -------------- | --------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| `async`        | Valkey    | `<application>-store-worker-async`               | Indexing, mails, and everything else that is processed asynchronously |
| `low_priority` | Database  | `<application>-store-worker-low-priority-<hash>` | Messages Shopware marks as low priority                               |
| `failed`       | Database  | `<application>-store-worker-failed`              | Messages that failed after all retries. This worker retries them.     |

Each worker deployment scales on the number of messages waiting in its transport:

- With an empty queue the deployment has zero pods. A pod is started within seconds of the first message arriving.
- One additional pod is added for roughly every 300 waiting messages, up to the maximum your plan allows.
- When the queue is empty again, the pods are removed after a short cooldown.

A worker pod runs `messenger:consume` in a loop with a time limit and a memory limit. The consumer stopping and starting again on its own is normal and does not count as a restart of the pod.

:::info
The scheduled task runner queues a few messages every five minutes. A worker pod appearing briefly every five minutes, even when you did not start anything, is expected.
:::

## Start the job

Run the reindex either in an interactive session or as a command in a dedicated container. The command variant is easier to follow afterwards:

```bash
sw-paas command create --script 'bin/console dal:refresh:index --use-queue'
sw-paas command logs --command-id <command-id>
```

Note the time you started it. The command only queues the work, so it reports `SUCCEEDED` long before the index is rebuilt. `bin/console es:status` tells you when indexing is complete, see [Check from inside the application](#check-from-inside-the-application).

If you have just enabled OpenSearch and do not yet have a populated index, expect search to return no results until the initial indexing work finishes. Deployment success does not mean the index is ready, see [How to set up OpenSearch](../guides/opensearch.md#post-enablement-actions). On a shop that already has a working index, a reindex, import or bulk update does not make search return no results. If it does, treat that as a search failure rather than a queue that is still draining.

## Where to look

Run `sw-paas open grafana` to get the Grafana URL and credentials for your application, then open the **Application Resources** dashboard. Set the time range to cover the moment you started the job.

The **Message Queues** row shows all three queues for the whole application and does not depend on the **deployment** variable. For the pod-level panels, set **deployment** to the `async` worker deployment, since that is the queue indexing goes to.

## What to watch

| Panel                                                | Healthy during a large job                                                                                   | Needs attention                                                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Messages per Queue, Queue Depth                      | `async` jumps when the job starts, then falls steadily towards zero.                                         | `async` plateaus or keeps growing for more than a few minutes while worker pods are running. `failed` is above zero and growing.                     |
| Available Replicas per Component                     | Worker replicas rise after the queue fills and fall back to zero once it is empty.                           | Worker replicas stay at zero while `async` is above zero for more than a minute.                                                                     |
| Pods & Autoscaling                                   | Running pods are below the dashed plan maximum, or reach it only briefly.                                    | Running pods sit on the dashed line for the whole job and the queue drains slowly. The plan limit is the bottleneck, not the application.            |
| Component Issues                                     | `All components: running`, or `scaling` while pods are added or removed.                                     | `error`, `not-found` or `unknown` for the worker.                                                                                                    |
| Memory Usage (of limits), Memory vs Limits (per pod) | Below the limit. Worker memory grows during indexing and is released when the consumer restarts itself.      | Pods approaching 100% of the limit.                                                                                                                  |
| OOM-Killed Containers (24h), Restarts (24h)          | Zero. The consumer's own time and memory limits do not show up here.                                         | Anything above zero. A killed worker loses the message it was processing, the message is retried, and the queue stalls or grows while this repeats.  |

:::info
Metrics are collected once a minute. On a small catalog the whole reindex can finish between two samples, so the dashboard may show only the worker pod and never the queue itself. That is fine. If the queue is visible and shrinking, the job is progressing.
:::

## Check the dependencies

If the worker looks healthy but `async` is not moving, check what the worker depends on.

**Valkey dashboard.** The `async` queue lives in the worker Valkey instance, which also stores carts. Select the worker instance. On **Memory Used**, the dashed line is the configured `maxmemory`. The worker instance uses the `noeviction` policy, which rejects writes that need additional memory at the limit rather than evicting keys. Rejected writes do not increase the eviction counter, so check memory usage together with Valkey OOM or write errors in the worker and storefront logs to detect a full queue. Evictions on **Evicted / Expired Keys** warrant checking which instance is selected and its configured eviction policy. Normal key expiration does not indicate a full queue.

**Database dashboard.** Indexing reads heavily from the database. Sustained **ACU Utilization** near the configured maximum slows every message down and also affects storefront requests.

**PHP-FPM dashboard.** Select the `storefront` component. The storefront scales on **Pool Utilization**, so a value that stays high while the job runs means the reindex is competing with customer traffic, and the storefront may already be at its plan maximum.

## Read the worker logs

Stream the worker logs while the job runs:

```bash
sw-paas application logs --component worker --follow --since 15m
```

During a healthy run the log is a steady sequence of `Received message`, `handled successfully` and OpenSearch `Request Success` lines. Filter for `ERROR` to find the problem when the queue stalls:

```bash
sw-paas application logs --component worker --since 15m --query '{component="worker"} |= "ERROR"'
```

The same filter is available in the **Logs** dashboard in Grafana by setting **component** to `worker` and **level** to `ERROR`. Memory exhausted errors, database timeouts, and connection errors to OpenSearch repeating on every retry explain a `failed` queue that keeps growing.

## Check from inside the application

Open an exec session with `sw-paas exec --new` and run:

```bash
bin/console messenger:stats
bin/console messenger:failed:show
bin/console es:status
```

The first command shows pending messages per transport and matches what the dashboard shows. The second lists failed messages with their error, which is the quickest way to find the root cause of a growing `failed` queue.

The third one is the done signal for an OpenSearch reindex. It reports the cluster status and whether indexing is still in progress:

```text
+-----------------+-----------+
| Name            | Status    |
+-----------------+-----------+
| Cluster Status  | green     |
| Available Nodes | 6         |
| Indexing        | completed |
+-----------------+-----------+
```

While `Indexing` is not `completed`, search results are incomplete even if the `async` queue already looks empty on the dashboard.

## When to open a ticket

Open a ticket when one of the following is true:

- The worker is pinned at the plan maximum for the whole job and the queue is not draining fast enough for your needs. This is a sizing conversation.
- Worker pods are OOM-killed or restarted repeatedly.
- Valkey memory on the worker instance has reached `maxmemory`, or the logs show Valkey OOM or write errors.
- The worker shows `error`, `not-found` or `unknown` under Component Issues.

Include the start time of the job, the command you ran, a screenshot of **Queue Depth** and **Pods & Autoscaling** covering the job, and the output of `messenger:failed:show` if the `failed` queue is above zero.

:::warning
A queue that drains steadily without errors or resource pressure usually does not require a ticket. If any of the criteria above apply, open a ticket even if the queue is still draining.
:::

## Reduce the impact next time

Long-running messages such as indexing delay time-critical messages such as order confirmation emails while they share the `async` queue. Route them to a separate transport so that mail and other short messages keep flowing during a reindex. See [Split message queues](../guides/message-queues.md).
