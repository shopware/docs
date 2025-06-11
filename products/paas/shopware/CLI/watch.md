---
nav:
  title: Monitor events
  position: 90
---

# Watch

The `watch` command allows you to monitor events related to a specific project in Shopware PaaS Native. It listens for real-time events associated with the project and its applications. You can specify the project ID, application IDs, and event types to filter the events you want to observe.

## Usage

```sh
sw-paas watch [flags]
```

## Flags

- `--project-id`: The ID of the project whose events you want to watch. If not provided, the command attempts to infer the project from the Git repository's remote URL.
- `--application-ids`: A list of application IDs whose events you want to monitor. If not provided, it watches all applications associated with the project.
- `--event-types`: A list of event types to filter (e.g., deployment events, application events). You can choose specific event types to subscribe to. By default, it listens to all events.

## Examples

Watch all events of a project:

```sh
  sw-paas watch --project-id abc123
```

Watch specific application events in a project:

```sh
  sw-paas watch --project-id abc123 --application-ids app1,app2
```

Watch specific event types:

```sh
  sw-paas watch --project-id abc123 --event-types "EVENT_TYPE_DEPLOYMENT_STARTED,EVENT_TYPE_DEPLOYMENT_FINISHED"
```

The `--event-types` flag allows you to filter the event types to watch for. The available event types are fetched from Shopware PaaS Native and are sorted for easy selection.

### Project ID and application IDs

- **`--project-id`**: The ID of the project is required to subscribe to its events. If the flag is not set, the command attempts to infer the project ID from the current Git remote (assuming a linked repository).
- **`--application-ids`**: You can optionally filter the events by specifying application IDs within the project. If omitted, it subscribes to all application events in the project.

### Event subscription

Once the `watch` command is triggered, it establishes a connection to the Shopware PaaS Native event stream and listens for the specified events. The events are printed out in real time to the terminal.
