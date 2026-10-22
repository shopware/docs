---
nav:
  title: Monitoring
  position: 40
---

# Monitoring

Shopware PaaS Native provides comprehensive monitoring capabilities to help you track the health and performance of your applications. With built-in monitoring tools, you can observe your application's behavior, troubleshoot issues, and ensure optimal performance in your cloud environment. This section introduces 3 key components used in monitoring: Logs, Traces and Events.

Grafana access is currently provided through credentials returned by the CLI via the `sw-paas open grafana` command. Single sign-on for Grafana and similar tools is not available at this stage.

Two profilers are supported for PHP requests: [Blackfire](./blackfire.md) and [Tideways](./tideways.md). Only one of them can be enabled at a time, and each requires your own account with the respective vendor. Other application performance monitoring tools are not currently supported as part of the platform.

Shopware PaaS Native does not currently provide managed load testing as part of the platform.
