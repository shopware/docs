---
nav:
  title: Monitor events
  position: 40
---

# Monitor events

## Real-time Event Monitoring

Shopware PaaS Native provides real-time event monitoring for your applications, allowing you to track deployments, application status changes, and other important events as they happen.

To start monitoring events, run the following command:

```bash
sw-paas watch
```

This command will start streaming events in real-time to your terminal.

## Monitoring Specific Applications

You can monitor events for specific applications within your project:

```bash
sw-paas watch --application-ids app1,app2
```

This is particularly useful in multi-application projects where you only want to focus on certain services.

## Filtering Event Types

To reduce noise and focus on specific types of events, you can filter by event type:

```bash
sw-paas watch --event-types "EVENT_TYPE_DEPLOYMENT_STARTED,EVENT_TYPE_DEPLOYMENT_FINISHED"
```

Common event types include:

- `EVENT_TYPE_DEPLOYMENT_STARTED` - When a deployment begins
- `EVENT_TYPE_DEPLOYMENT_FINISHED` - When a deployment completes

The event stream will continue running until you stop it with `Ctrl+C`. All events are displayed in real-time with timestamps and detailed information about what's happening in your project.

## Understanding different Event Types

Events are generally linked to a preceding action.
Each action is connected to a specific event type, which is emitted when a state change occurs.
The type of each event is indicated in the output of the `sw-paas watch` command and can help to understand what is happening in your project.

Especially for deployments, the history of the events can be used to understand what happened during a deployment.
To list all events of a specific deployment, use the following command:

```bash
sw-paas application deploy get 
```

The output of the `DEPLOYMENT STATUS HISTORY` shows all events that were emitted during the deployment.
This contains events from the underlying PaaS infrastructure as well as events from the shop itself.

The following table lists the most common event types and their descriptions:

| Event | Description |
|-------|-------------|
| `UNSPECIFIED` | Default or unspecified deployment status |
| `PENDING` | Deployment is queued and waiting to start |
| `BASE` | Infrastructure: Base infrastructure components are being deployed |
| `BASE_FAILED` | Infrastructure: Base infrastructure deployment has failed |
| `BASE_SUCCESS` | Infrastructure: Base infrastructure deployment completed successfully |
| `SHOP` | Infrastructure: Shop-specific infrastructure components are being deployed |
| `SHOP_FAILED` | Infrastructure: Shop infrastructure deployment has failed |
| `SHOP_SUCCESS` | Infrastructure: Shop infrastructure deployment completed successfully |
| `DEPLOYING_STORE` | Store: Shopware store application is being deployed |
| `DEPLOYING_STORE_FAILED` | Store: Shopware store deployment has failed |
| `DEPLOYING_STORE_SUCCESS` | Store: Shopware store deployment completed successfully |
| `DEPLOYMENT_SUCCESS` | Complete deployment finished successfully |
| `DEPLOYMENT_FAILED` | Complete deployment has failed |






