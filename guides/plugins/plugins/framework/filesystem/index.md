---
nav:
  title: Filesystem
  position: 70

---

# Filesystem

Plugins often need the ability to read and write files. Thanks to the [Flysystem](https://flysystem.thephpleague.com/docs/) that Shopware uses, this can be managed very easily. It does not matter whether the files are stored on the local file system or at a cloud provider. The read and write access remains the same. If you want to learn more about the configuration of the file system in Shopware, have a look at the [filesystem guide](../../../../hosting/infrastructure/filesystem). For example, you will learn how to outsource the file system to the Amazon cloud. In a plugin, we don't have to worry about the configuration and can use the advantages of the Flysystem directly.
