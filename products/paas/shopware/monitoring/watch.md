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
