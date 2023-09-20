---
nav:
  title: Filesystem
  position: 10

---

# Filesystem

## Overview

Shopware 6 stores and processes a wide variety of files. This goes from product images or videos to generated documents such as invoices or delivery notes. This data should be stored securely, and backups should be generated regularly. Therefore, it is advisable to set up storage service, which scales with the size of the data, performs backups, and ensures data redundancy. In addition, for cluster setups with multiple setups, it is **necessary** to share the files via external storage so that each app server can access the corresponding data.

## Flysystem overview

Shopware 6 can be used with several cloud storage providers. It uses [Flysystem](https://flysystem.thephpleague.com/docs/) to provide a common interface between different providers as well as the local file system. This enables your shops to read and write files through a common interface.

The file system can be divided into multiple adapters. Each adapter can handle one or more of the following directories: media. sitemaps, and more. Of course, you can also use the same configuration for:

* private files: invoices, delivery notes, plugin files, etc.
* public files: product pictures, media files, plugin files in general
* theme files
* sitemap files
* bundle assets files

## Configuration

The configuration for file storage of Shopware 6 resides in the general bundle configuration:

```text
<project root>
└── config
   └── packages
      └── shopware.yml
```

To set up a non-default filesystem for your shop, you need to add the `filesystem:` map to the `shopware.yml`. Under this key, you can separately define your storage for the public, private, theme, sitemap, and asset \(bundle assets\).

::: info
You can also change only the URL of the file systems. This is useful if you want to use a different domain for your files. For example, you can use a CDN for your public files.
:::

```yaml
shopware:
  filesystem:
    public:
      url: "{url-to-your-public-files}"
      # The Adapter Configuration
    private:
      visibility: "private"
      # The Adapter Configuration
    theme:
      url: "{url-to-your-theme-files}"
      # The Adapter Configuration
    asset:
      url: "{url-to-your-asset-files}"
      # The Adapter Configuration
    sitemap:
      url: "{url-to-your-sitemap-files}"
      # The Adapter Configuration
```

If you want to regulate the uploaded file types, then you could add the keys `allowed_extensions`for the public filesystem or `private_local_download_strategy` for the private filesystem.
With the `private_local_download_strategy` key you could choose the download strategy for private files (e.g. the downloadable products):

```yaml
shopware:
  filesystem:
    public:
      # The Adapter Configuration
    private:
      # The Adapter Configuration
    allowed_extensions: # Array with allowed file extensions for public filesystem
    private_allowed_extensions: # Array with allowed file extensions for private filesystem
    private_local_download_strategy: # Name of the download strategy: php, x-sendfile or x-accel
```

Following download strategies are valid:

* `php` (default): A streamed response of content type `application/octet-stream` with binary data
* `x-sendfile` (Apache only): X-Sendfile allows you to use PHP to instruct the server to send a file to a user, without having to load that file into PHP. You must have the [`mod_xsendfile`](https://github.com/nmaier/mod_xsendfile) Apache module installed.
* `x-accel` (Nginx only): X-accel allows for internal redirection to a location determined by a header returned from a backend. See the [example configuration](https://www.nginx.com/resources/wiki/start/topics/examples/x-accel/).

## Integrated adapter configurations

### Local

```yaml
shopware:
    filesystem:
      {ADAPTER_NAME}:
        type: "local"
        config:
          root: "%kernel.project_dir%/public"
```

### Amazon S3

```yaml
shopware:
    filesystem:
      {ADAPTER_NAME}:
        type: "amazon-s3"
        url: "https://your-cloudfront-url"
        visibility: "private" # Default is "public", can be set only on shopware.filesystem.private
        config:
            bucket: "{your-public-bucket-name}"
            region: "{your-bucket-region}"
            endpoint: "{your-s3-provider-endpoint}"
            root: "{your-root-folder}"
            # Optional, otherwise will be automatically discovered with AWS content discovery
            credentials:
              key: '{your-access-key}'
              secret: '{your-secret-key}'
```

If your S3 provider does not use buckets as subdomain like Minio in default configuration, you need to set `use_path_style_endpoint` to `true` inside `config`.

### Google Cloud Platform

The bucket needs to use the "Fine-grained" [ACL mode](https://cloud.google.com/storage/docs/access-control#choose_between_uniform_and_fine-grained_access). This is required so that Shopware can manage the ACL of the objects.

```yaml
shopware:
    filesystem:
      {ADAPTER_NAME}:
        type: "google-storage"
        url: "https://storage.googleapis.com/{your-public-bucket-name}"
        visibility: "private" # Default is "public", can be set only on shopware.filesystem.private
        config:
            bucket: "{your-public-bucket-name}"
            projectId: "{your-project-id}"
            keyFilePath: "{path-to-your-keyfile}"
```

## Add your own adapter

To create your own adapter, check out the [official Flysystem guide](https://flysystem.thephpleague.com/v1/docs/advanced/creating-an-adapter/).

To make your adapter available in Shopware, you will need to create an AdapterFactory for your Flysystem provided adapter. An example of that could look like this:

```php
<?php

use Shopware\Core\Framework\Adapter\Filesystem\Adapter\AdapterFactoryInterface;
use League\Flysystem\AdapterInterface;

class MyFlysystemAdapterFactory implements AdapterFactoryInterface
{
    public function getType(): string
    {
        return 'my-adapter-prefix'; // This must match with the type in the yaml file
    }

    public function create(array $config): AdapterInterface
    {
        // $config contains the given config from the yaml
        return new MyFlysystemAdapter($config);
    }
}
```

This new class needs to be registered in the DI with the tag `shopware.filesystem.factory` to be usable.
