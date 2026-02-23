---
nav:
  title: Filesystem - Flysystem
  position: 10

---

# Filesystem

Plugins often need to read and write files. Shopware uses [Flysystem](https://flysystem.thephpleague.com/docs/), a file storage library for PHP. It provides a unified interface to interact with different storage backends, whether local file systems or cloud providers.

Plugins do not require handling underlying configuration. It is possible to use the Flysystem abstraction directly, and the read/write API remains the same regardless of where files are stored.

To learn more about filesystem configuration in Shopware, see the [filesystem guide](../../../../hosting/infrastructure/filesystem), including details on using cloud storage such as Amazon S3.

## Prerequisites

This guide is built upon both the [Plugin base guide](../../plugin-base-guide) and the [Add custom service guide](../../plugin-fundamentals/add-custom-service).

## Overview

The Flysystem enables plugins to read and write files through a common interface. There are several default namespaces/directories that are available, for example:

* One for private files of the shop: invoices, delivery notes
* One for public files: product pictures, media files
* One for theme files
* One for sitemap files
* One for bundle assets files

However, every plugin/bundle gets an own namespace that should be used for private or public plugin files. These are automatically generated during the plugin installation. The namespace is prefixed with the [Snake case](https://en.wikipedia.org/wiki/Snake_case) plugin name followed by `filesystem` `.` `private` or `public`. For our example plugin, this would be

* `swag_basic_example.filesystem.public` for public plugin files
* `swag_basic_example.filesystem.private` for private plugin files

## Use filesystem in a service

To make use of the filesystem, we register a new service, which helps to read and write files to the filesystem.

```php
// <plugin root>/src/Service/ExampleFilesystemService.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use League\Flysystem\FilesystemOperator;

class ExampleFilesystemService
{
    /**
     * @var FilesystemOperator
     */
    private FilesystemOperator $fileSystemPublic;
    /**
     * @var FilesystemOperator
     */
    private FilesystemOperator $fileSystemPrivate;

    /**
     * ExampleFilesystemService constructor.
     * @param FilesystemOperator $fileSystemPublic
     * @param FilesystemOperator $fileSystemPrivate
     */
    public function __construct(FilesystemOperator $fileSystemPublic, FilesystemOperator $fileSystemPrivate)
    {
        $this->fileSystemPublic = $fileSystemPublic;
        $this->fileSystemPrivate = $fileSystemPrivate;
    }

    public function readPrivateFile(string $filename) {
        return $this->fileSystemPrivate->read($filename);
    }

    public function writePrivateFile(string $filename, string $content) {
        $this->fileSystemPrivate->write($filename, $content);
    }

    public function listPublicFiles(): array {
        return $this->fileSystemPublic->listContents();
    }
}
```

This service makes use of the private und public filesystem. As you already know, this php class has to be registered as a service in the dependency injection container. This is also the place where we define which filesystem will be handed over to the constructor. To make use of the plugin private and public files, the service definition could look like this:

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Service\ExampleFilesystemService">
            <argument type="service" id="swag_basic_example.filesystem.public"/>
            <argument type="service" id="swag_basic_example.filesystem.private"/>
            <!--
            There are also predefined file system services
            <argument type="service" id="shopware.filesystem.private"/>
            <argument type="service" id="shopware.filesystem.public"/>
            -->
        </service>
    </services>
</container>
```

Now, this service can be used to read or write files to the private plugin filesystem or to list all files in the public plugin filesystem. You should visit the [Flysystem API documentation](https://flysystem.thephpleague.com/docs/usage/filesystem-api/) for more information.
