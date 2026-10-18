---
nav:
  title: Sync API Error Handling
  position: 45

---

# Sync API: transaction and error behavior

This page describes how `POST /api/_action/sync` handles a failing operation in a batch in Shopware 6.7.

## One shared write-command queue

`EntityWriter::sync()` creates one `WriteCommandQueue` per request. It loops over all operations, extracts their commands into that queue, calls `$context->getExceptions()->tryToThrow()`, and then makes a single `$this->gateway->execute(...)` call.

If operation 23 of 100 produces a validation exception while its commands are extracted, the queue isn't executed.

## Transaction

The default gateway runs the commands of the queue through `RetryableTransaction::retryable()`. An exception escaping that transactional execution is intended to roll back the queue. The gateway then dispatches `WriteCommandExceptionEvent` and throws the exception again.

Exceptions caught by the per-command handler mark the current command as failed and are thrown again, possibly after exception mapping. Batched insert failures can occur outside that handler.

Pre-write and post-write validation run inside the transaction. `WriteInputValidator`, `SyncOperation` validation and the `tryToThrow()` call in `EntityWriter` run before it.

An exception during operation preparation or command execution isn't turned into an operation-level error, and the request doesn't continue on a best-effort basis.

### Retries

`RetryableTransaction` retries at the outermost transaction level when it catches `TransactionRolledBack`, `DeadlockException`, `LockWaitTimeoutException`, or a `DriverException` whose message matches `SAVEPOINT [^\s]+ does not exist`. It retries up to 10 times after the first attempt, so there are at most 11 attempts. A call that starts inside an existing transaction throws the exception again without retrying. Other exceptions aren't retried.

## Events and side effects

`SyncService` dispatches the written and deleted events after `writer->sync()` returns, so after the transaction wrapper has returned. A failing subscriber or synchronous indexing can therefore fail the request after the data is already written. `EntityWriteEvent` is dispatched before the wrapper, and its success callbacks run after the wrapper returns. `EntityDeleteEvent` and the pre-write and post-write validation run inside the wrapper. `WriteCommandExceptionEvent` is dispatched from the gateway's outer catch.

A database rollback doesn't guarantee that filesystem changes, dispatched messages or other external side effects of event subscribers are reversed.

## Indexing headers

`SyncController` reads these headers into the sync behavior:

| Header              | Description                                                                                                                                 |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `indexing-behavior` | `disable-indexing` or `use-queue-indexing` change the indexing state of the context.                                                        |
| `indexing-skip`     | Comma-separated indexing option names to add to indexing-message skip lists, for example `product.stock`.                                   |
| `indexing-only`     | Comma-separated indexing option names to allow on returned indexing messages; other options from each indexer's `getOptions()` are skipped. |

These option filters don't prevent the indexers' `update()` methods from running. Some indexing work happens in `update()` before returned messages are handled or queued.

## The `fail-on-error` header

The generated OpenAPI schema for this endpoint lists a `fail-on-error` header: "To continue upcoming actions on errors, set the `fail-on-error` header to `false`." The Administration JavaScript sends this header too.

The default server-side Sync implementation doesn't use this header to control error handling. The header appears only in the JSON schema, no PHP code reads it, and `SyncController` builds its behavior from the three indexing headers only.

## Response

A successful request returns HTTP status `200`. Its result fields are `data`, `notFound` and `deleted`; these contain entity-keyed maps when populated and may be empty arrays. The serialized structure also includes the inherited `extensions` field. Primary keys can be strings or composite-key structures.

Deleting a nonexistent target is not necessarily an exception: its primary key can be reported in `notFound` while the request succeeds.

Although the OpenAPI schema lists `payload` as required, runtime operation validation also accepts a nonempty `criteria` without `payload`.

## Retrying and splitting requests

After a payload-validation failure before command execution, correct the payload and retry. After an error during or after command execution, or when you don't get a response, check the persisted state before you replay the request.

Each Sync request builds its own write-command queue, which the default gateway executes in a transaction that can be retried. Send independent batches as separate requests, and send one row per request if each top-level payload row needs its own queue. A row can still write associated records or trigger cascading changes, and a criteria-based delete can select multiple records. Keep the order and dependencies between requests in mind. Smaller independent requests can reduce the work a transactional failure affects.

This page doesn't cover the exact error response format of a failed request. For other headers, see [Request Headers](./request-headers.md).
