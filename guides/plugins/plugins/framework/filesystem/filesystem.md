---
nav:
  title: Filesystem - Flysystem
  position: 10

---

# Filesystem - Flysystem

## Overview

Flysystem is a file storage library for PHP. It provides one interface to interact with many types of filesystems. The Flysystem file system in Shopware is flexible, allowing seamless interaction with various file storage systems. It provides a consistent interface to access, manipulate, and manage files across different storage backends.

## Prerequisites

This guide is built upon both the [Plugin base guide](../../plugin-base-guide) and the [Add custom service guide](../../plugin-fundamentals/add-custom-service).

## Flysystem overview

The Flysystem enables your plugin to read and write files through a common interface. There are several default namespaces/directories that are available, for example:

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
