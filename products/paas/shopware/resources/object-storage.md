---
nav:
  title: Object Storage
  position: 30
---

# Object Storage

## Introduction

Applications in Shopware PaaS Native are created by default with two S3-compatible object storage buckets. A public bucket and a private bucket.

Shopware filesystem is configured to use S3-compatible object storage by default for new applications. This storage setup is part of the platform design and should not be changed later.

## Access limitations

You cannot access or modify the underlying S3 object storage directly from outside the container environment.

If you need to add media or otherwise write to the Shopware filesystem, use the media manager in Shopware Admin, the Shopware API, or run a PHP script from an environment that has access to the mounted filesystem.

The Shopware filesystem is available in these contexts:

- `storefront`
- `admin`
- `worker`
- `exec` sessions
- the `migration` step
- the `setup` step

The Shopware filesystem is not available in the `build` step.

You can learn more about the Shopware filesystem [here](../../../../guides/hosting/infrastructure/filesystem.md).
