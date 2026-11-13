---
nav:
  title: Databases
  position: 20
---

# Databases

## Introduction

Shopware PaaS Native provides a managed MySQL cluster for each application created where we handle: automatic backups and recovery, high availability, performance monitoring and metrics, resource scaling (CPU, RAM, storage), automatic encryption of data at rest and in transit.

## Connecting to Database Cluster

To connect to your database via CLI:

```sh
sw-paas open service --service database --port 3306
```

Database access is provided through the CLI tunnel. Direct public database exposure is not supported.

### Note

Please check the [known issues](../known-issues.md) regarding network considerations when running this command.

## Maintenance window

Every database cluster has a weekly **maintenance window** in which the platform applies minor engine version upgrades and operating system patches to the cluster and its instances.

By default, a new application gets a 30-minute slot between **02:00 and 05:00 UTC**, a low-traffic period for European shops. Slots are spread across the week, so the databases of different applications are not patched at the same time. The slot is stored with the application and does not change on redeployment.

If a different time suits your shop better, set your own window with `services.mysql.maintenance_window` in [`application.yaml`](../fundamentals/application-yaml.md#servicesmysqlmaintenance_window). The window must last at least 30 minutes and must not overlap the daily backup window of 01:00–02:00 UTC.

Maintenance only takes place when there is a pending change for the cluster. When it does, the database can be briefly unavailable or fail over to another instance, which can cause a short period of connection errors in the shop. Keep that in mind when scheduling long-running jobs, such as imports, that cannot tolerate a reconnect.

For backups and point-in-time recovery, see [How often are backups taken](../faq.md#how-often-are-backups-taken-and-how-long-are-they-kept).
