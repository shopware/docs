# Filesystem - Flysystem

## Overview

Plugins often need the ability to read and write files. Thanks to the [Flysystem](https://flysystem.thephpleague.com/docs/) that Shopware uses, this can be managed very easily. It does not matter whether the files are stored on the local file system or at a cloud provider. The read and write access remains the same. If you want to learn more about the configuration of the file system in Shopware, have a look at the [filesystem guide](../../../../hosting/infrastructure/filesystem.md). There you will learn how to outsource the file system to the Amazon cloud, for example. In a plugin we don't have to worry about the configuration and can use the advantages of the Flysystem directly.

## Prerequisites

This guide is built upon both the [Plugin base guide](../../plugin-base-guide.md) as well as the [Add custom service guide](../../plugin-fundamentals/add-custom-service.md).

## Flysystem overview

The Flysystem enables your plugin to read and write files through a common interface. There are several default namespaces/directories that are available, for example:

* One for general private files of the shop: invoices, delivery notes
* One for general public files: product pictures, media files
* One for theme files
* One for sitemap files
* One for bundle assets files

However, every plugin/bundle gets an own namespace that should be used for private or public plugin files. These are automatically generated during the plugin installation. The namespace is prefixed with the [Snake case](https://en.wikipedia.org/wiki/Snake_case) plugin name followed by `filesystem` `.` `private` or `plugin`. For our example plugin this would be

* `swag_example_plugin.filesystem.public` for public plugin files
* `swag_example_plugin.filesystem.private` for private plugin files

## Use filesystem in a service

To make use of the filesystem we register a new service, which helps to read and write files to the filesystem.

```php
// <plugin root>/src/Service/ExampleFilesystemService.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Service;

use League\Flysystem\FilesystemInterface;

class ExampleFilesystemService
{
    /**
     * @var FilesystemInterface
     */
    private FilesystemInterface $fileSystemPublic;
    /**
     * @var FilesystemInterface
     */
    private FilesystemInterface $fileSystemPrivate;

    /**
     * ExampleFilesystemService constructor.
     * @param FilesystemInterface $fileSystemPublic
     * @param FilesystemInterface $fileSystemPrivate
     */
    public function __construct(FilesystemInterface $fileSystemPublic, FilesystemInterface $fileSystemPrivate)
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

This service makes use of the private und public filesystem of the plugin. As you already know, this php class has to be registered as a service in the dependency injection container. This is also the place where we define which filesystem will be handed over to the constructor. To make use of the plugin private and public files, the service definition could look like this:

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

Now, this service can be used to read or write files to the private plugin filesystem or to list all files in the public plugin filesystem. You should visit the [Flysystem API documentation](https://flysystem.thephpleague.com/v1/docs/usage/filesystem-api/) for more information.
