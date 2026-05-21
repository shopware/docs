---
nav:
  title: Filesystem
  position: 70

---

# Filesystem

Plugins often need the ability to read and write files. Shopware uses [Flysystem](https://flysystem.thephpleague.com/docs/), a file storage library for PHP. It provides a unified interface to interact with different storage backends, whether local file systems or cloud providers.

Plugins do not require handling underlying configuration. It is possible to use the Flysystem abstraction directly, and the read/write API remains the same regardless of whether files are stored on a local file system or with a cloud provider.

To learn more about filesystem configuration in Shopware, see the [filesystem guide](../../../../hosting/infrastructure/filesystem.md), including details on using cloud storage (such as Amazon S3) to outsource the file system.
