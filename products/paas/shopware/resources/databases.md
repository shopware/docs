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

#### Note

Please check the [known issues](../known-issues.md) regarding network considerations when running this command.
