---
nav:
  title: Filesystem
  position: 40

---

# Filesystem

## Overview

Shopware 6 stores a wide variety of files — product images and videos, generated documents such as invoices and delivery notes, theme assets, and sitemaps. By default, all of these are written to the local disk inside your project directory. That is fine for a single server, but it stops working as soon as you scale out:

* In a **cluster** with multiple app servers, every server needs to read and write the same files. Local disk is per-server, so files uploaded on one node are invisible to the others. A **shared, external storage is required** (see [Cluster Setup](../installation-updates/cluster-setup)).
* Even on a **single server**, external object storage (S3 and compatible providers) gives you automatic backups, redundancy, and storage that scales with your data without filling up the server disk.

Shopware uses [Flysystem](https://flysystem.thephpleague.com/docs/) to talk to all of these storage backends through one common interface, so your shop reads and writes files the same way regardless of where they physically live.

### Which storage should I use?

| Scenario                                               | Recommended storage                                              |
|--------------------------------------------------------|------------------------------------------------------------------|
| Local development / single server, small media library | `local` (the default — no setup needed)                          |
| Single server, want backups & redundancy               | S3 or an S3-compatible bucket                                    |
| Multiple app servers (cluster)                         | **Required:** S3 or S3-compatible shared bucket                  |
| Already on local but serving heavy traffic             | Keep `local`, put a [CDN](#serving-files-through-a-cdn) in front |

## How the filesystem is structured

The filesystem is split into separate **adapters**, one per purpose. Each adapter can point at a different storage backend, but in practice you usually configure them all the same way. The following table lists the adapters and their default visibility and paths.

| Filesystem | Visibility | What it holds                                           | Default local path |
|------------|------------|---------------------------------------------------------|--------------------|
| `public`   | public     | Product images, media files, generally accessible files | `public/`          |
| `private`  | private    | Invoices, delivery notes, downloadable product files    | `files/`           |
| `theme`    | public     | Compiled theme files (CSS, JS)                          | inherits `public`  |
| `asset`    | public     | Bundle/plugin assets                                    | inherits `public`  |
| `sitemap`  | public     | Generated sitemap files                                 | inherits `public`  |
| `temp`     | private    | Temporary working files                                 | `var/`             |

::: info
`theme`, `asset`, and `sitemap` **inherit the `public` configuration** when you don't configure them explicitly. So configuring `public` for S3 automatically moves theme, asset, and sitemap files to S3 too. See [Fallback adapter configuration](#fallback-adapter-configuration) for the important caveat when you change `public` later.
:::

## Configuration

The filesystem configuration lives in the bundle configuration:

```text
<project root>
└── config
   └── packages
      └── shopware.yml
```

To use a non-default storage, add a `filesystem:` map under the `shopware:` key. Each adapter accepts the following keys:

| Key          | Description                                                                                                                                         |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `type`       | The adapter to use: `local`, `amazon-s3`, or `google-storage`. **Required**                                                                         |
| `url`        | Public base URL under which the files are reachable. If omitted, Shopware derives it from `APP_URL`. Use this to point public files at a CDN domain |
| `visibility` | `public` (default) or `private`. Only `private` is meaningful for the `private` filesystem                                                          |
| `config`     | Adapter-specific options (bucket, region, credentials, root, …). See [Supported adapters](#supported-adapters)                                      |

```yaml
shopware:
  filesystem:
    public:
      type: "amazon-s3"
      url: "{url-to-your-public-files}"
      config:
        # adapter-specific options
    private:
      type: "amazon-s3"
      visibility: "private"
      config:
        # adapter-specific options
```
<!-- {"WATCHER_URL":"https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/Resources/config/packages/shopware.yaml","WATCHER_HASH":"183f85ba8f15e8e7d0006b70be20940f","WATCHER_CONTAINS":"filesystem"} -->

### Avoiding repetition with YAML anchors

If multiple filesystems share the same backend, define the configuration once with a YAML anchor (`&name`) and reference it (`*name`) everywhere else. This is the recommended way to move all public-facing files to one bucket:

```yaml
shopware:
  filesystem:
    public: &s3
      type: "amazon-s3"
      url: "{{S3_URL}}"
      config:
        bucket: "{{AWS_BUCKET}}"
        region: "{{AWS_REGION}}"
        endpoint: "{{AWS_ENDPOINT}}"
        use_path_style_endpoint: true
        credentials:
          key: "{{AWS_ACCESS_KEY_ID}}"
          secret: "{{AWS_SECRET_ACCESS_KEY}}"
    theme: *s3
    asset: *s3
    sitemap: *s3
```

### Fallback adapter configuration

`theme`, `asset`, and `sitemap` use the `public` configuration when they are not set explicitly. This matters when you **change** the `public` adapter later: as soon as you do, theme/asset/sitemap follow it — unless you pin them back to the old configuration.

For example, to move only `public` to S3 while keeping theme, asset, and sitemap on local storage, you must set them explicitly:

```yaml
shopware:
  filesystem:
    public:
      type: "amazon-s3"
      url: "{{S3_URL}}"
      config:
        bucket: "{{AWS_BUCKET}}"
        region: "{{AWS_REGION}}"
        endpoint: "{{AWS_ENDPOINT}}"
        credentials:
          key: "{{AWS_ACCESS_KEY_ID}}"
          secret: "{{AWS_SECRET_ACCESS_KEY}}"
    theme: &local
      type: "local"
      url: "https://your.domain/public"
      config:
        root: "%kernel.project_dir%/public"
    asset: *local
    sitemap: *local
```

## Supported adapters

### Local

The default. Files are stored on the server's disk relative to the project directory.

```yaml
shopware:
  filesystem:
    public:
      type: "local"
      config:
        root: "%kernel.project_dir%/public"
```

| `config` key               | Description                                                                                           |
|----------------------------|-------------------------------------------------------------------------------------------------------|
| `root`                     | Directory the files are stored in. **Required.**                                                      |
| `file` / `dir`             | Optional permission overrides, e.g. `file: { public: 0644 }`. Defaults derive from the process umask. |
| `enforce_file_permissions` | Apply the permissions above on write. Defaults to `true`.                                             |

### Amazon S3 (and S3-compatible providers)

Works with Amazon S3 and any S3-compatible storage such as **MinIO, Cloudflare R2, DigitalOcean Spaces, Hetzner Object Storage, or Ceph**.

Install the adapter package first:

```bash
composer require league/flysystem-async-aws-s3
```

```yaml
shopware:
  filesystem:
    public:
      type: "amazon-s3"
      url: "https://your-cdn-or-bucket-url"
      config:
        bucket: "{your-bucket-name}"
        region: "{your-bucket-region}"
        endpoint: "{your-s3-provider-endpoint}"   # optional for AWS, required for most others
        use_path_style_endpoint: false             # set true for MinIO and similar
        root: "{optional-prefix-inside-bucket}"
        # Optional: omit to use the instance role / environment credentials
        credentials:
          key: "{your-access-key}"
          secret: "{your-secret-key}"
```

| `config` key                             | Description                                                                                                     |
|------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| `bucket`                                 | Bucket name (**Required**)                                                                                      |
| `region`                                 | Bucket region, e.g. `eu-central-1` (**Required**)                                                               |
| `endpoint`                               | Custom endpoint URL. Optional for AWS; required for most S3-compatible providers                           |
| `use_path_style_endpoint`                | Set to `true` when the provider does **not** put the bucket in the subdomain (e.g. MinIO in its default setup) |
| `root`                                   | Prefix inside the bucket all paths are stored under (**Optional**)                                               |
| `credentials.key` / `credentials.secret` | Access key and secret. Optional — if omitted, AWS credential discovery (env vars, instance/IAM role) is used.  |
| `options`                                | Extra options passed through to the underlying AsyncAws S3 client (**Optional**)                                  |

::: warning
Omit the `credentials` block on AWS infrastructure (EC2, ECS, EKS) and grant access through an **IAM role** instead. This keeps long-lived secrets out of your configuration.
:::

For advanced control over timeouts, retries, and proxies, see [Custom HTTP client for S3](#custom-http-client-for-s3).

### Google Cloud Storage

Install the adapter package first:

```bash
composer require league/flysystem-google-cloud-storage
```

```yaml
shopware:
  filesystem:
    public:
      type: "google-storage"
      url: "https://storage.googleapis.com/{your-bucket-name}"
      config:
        bucket: "{your-bucket-name}"
        projectId: "{your-project-id}"
        keyFilePath: "{path-to-your-service-account-key.json}"
```

| `config` key  | Description                                                                |
|---------------|----------------------------------------------------------------------------|
| `bucket`      | Bucket name (**Required**)                                                 |
| `projectId`   | Google Cloud project ID (**Required**)                                     |
| `keyFilePath` | Path to a service account key JSON file.                                   |
| `keyFile`     | The service account key as an inline array (alternative to `keyFilePath`). |
| `root`        | Prefix inside the bucket (**Optional**)                                        |

The bucket must use the [fine-grained ACL mode](https://cloud.google.com/storage/docs/access-control#choose_between_uniform_and_fine-grained_access) so that Shopware can manage object visibility.

## Migrating an existing filesystem to a new adapter

Changing the `filesystem` configuration only tells Shopware **where** to read and write files from now on. It does **not** move files that already exist. If you switch a shop with existing media from `local` to `amazon-s3` without copying the files first, that media will return 404 errors, because Shopware will look for it in the new (empty) bucket.

A migration therefore has three steps, in this order:

1. Copy the existing files to the new storage.
2. Update the configuration to point to the new adapter.
3. Re-generate the files Shopware can rebuild itself (bundle assets, theme).

The example migrates from `local` to `amazon-s3`, but the procedure applies to any adapter.

::: warning
Run the migration during low-traffic hours or in maintenance mode. Files uploaded between the initial copy and the configuration switch would otherwise land on the old storage. See [Avoiding gaps during the copy](#avoiding-gaps-during-the-copy).
:::

### 1. Copy the existing files

With the default `local` adapter the files live in the project directory:

| Filesystem | Default location                                                                       |
|------------|----------------------------------------------------------------------------------------|
| `public`   | `public/media`, `public/thumbnail`, `public/theme`, `public/bundles`, `public/sitemap` |
| `private`  | `files/`                                                                               |

[`rclone`](https://rclone.org/) is recommended: it works with any S3-compatible provider, resumes interrupted transfers, and re-syncs only changed files. The AWS CLI works for native S3 as well.

Using `rclone` (configure a remote named `s3` first via `rclone config`):

```bash
# Public files
rclone copy public/media     s3:your-bucket/media
rclone copy public/thumbnail s3:your-bucket/thumbnail
rclone copy public/sitemap   s3:your-bucket/sitemap

# Private files (only if you migrate the private filesystem too)
rclone copy files            s3:your-bucket-private/files
```

Using the AWS CLI:

```bash
aws s3 sync public/media     s3://your-bucket/media
aws s3 sync public/thumbnail s3://your-bucket/thumbnail
aws s3 sync public/sitemap   s3://your-bucket/sitemap
```

::: info
Keep the relative paths identical. Shopware stores only the **relative** path of a file in the database (for example `media/ab/cd/example.jpg`) and resolves it against the configured adapter at runtime. As long as the path inside the bucket matches the path on disk, no database changes are needed. If you set a `root` for the adapter, the bucket prefix must match that `root`.

You can skip `public/theme` and `public/bundles` here — step 3 regenerates them.
:::

### 2. Update the configuration

Switch the relevant filesystems to the new adapter. Remember the [fallback behavior](#fallback-adapter-configuration): `theme`, `asset`, and `sitemap` follow `public` unless set explicitly.

```yaml
# config/packages/shopware.yml
shopware:
  filesystem:
    public: &s3
      type: "amazon-s3"
      url: "{{S3_URL}}"
      config:
        bucket: "{{AWS_BUCKET}}"
        region: "{{AWS_REGION}}"
        endpoint: "{{AWS_ENDPOINT}}"
        use_path_style_endpoint: true
        credentials:
          key: "{{AWS_ACCESS_KEY_ID}}"
          secret: "{{AWS_SECRET_ACCESS_KEY}}"
    theme: *s3
    asset: *s3
    sitemap: *s3
```

Install the adapter package if you have not already:

```bash
composer require league/flysystem-async-aws-s3
```

### 3. Re-generate rebuildable files

Bundle assets and the compiled theme are derived from the source code, so let Shopware write them directly into the new storage instead of copying them. After the configuration points to the new adapter, run:

```bash
# Copies bundle (plugin/app) assets into the configured asset filesystem
bin/console asset:install

# Re-compiles the storefront theme into the configured theme filesystem
bin/console theme:compile
```

### Verifying the migration

* Open the storefront and Administration and confirm media loads.
* In the browser network tab, media URLs should point to your S3 endpoint or CDN domain (the configured `url`), not the local domain.
* Upload a new media file in the Administration and confirm it appears in the bucket.

Once verified, you can remove the old files from the local `public/` and `files/` directories.

### Avoiding gaps during the copy

For shops with active uploads, do a two-pass sync so nothing created during the migration is lost:

1. Run the copy from step 1 once while the shop is still live.
2. Switch the configuration (step 2) and deploy.
3. Run the same `rclone copy` / `aws s3 sync` commands again — both only transfer files that are missing or changed, so this second pass catches anything uploaded during the window.

Alternatively, enable maintenance mode for the duration of the migration to prevent uploads entirely.

## Serving files through a CDN

To serve public files from a CDN, set the `url` of the public filesystem to your CDN domain. This changes only the URL Shopware generates for the files; where they are stored is still controlled by `type`/`config`.

```yaml
# <project root>/config/packages/prod/shopware.yml
shopware:
  filesystem:
    public:
      url: "https://cdn.your-domain.com"
      type: "local"
      config:
        root: "%kernel.project_dir%/public"
```

::: info
Note the **prod** in the config path above — CDNs are typically used in production only. To enable it everywhere, put it in `config/packages/shopware.yml` instead.
:::

### Media URL strategy

Shopware can lay out media paths using different strategies. The strategy affects how predictable a file's URL is and how well it caches. It is set via the `SHOPWARE_CDN_STRATEGY_DEFAULT` environment variable (mapped to `cdn.strategy`).

| Strategy            | Behavior                                                                               |
|---------------------|----------------------------------------------------------------------------------------|
| `id` (default)      | Path is derived from a hash of the media ID. URLs are not guessable from the filename. |
| `filename`          | Path is derived from a hash of the filename.                                           |
| `physical_filename` | Path includes a timestamp and the physical filename.                                   |
| `plain`             | Simple, human-readable path without hashing.                                           |

```dotenv
# .env
SHOPWARE_CDN_STRATEGY_DEFAULT=id
```

::: warning
Changing the strategy on a shop with existing media changes the generated paths for those files, which will break existing URLs unless the files are moved to match. Choose a strategy before going live, or plan a migration of the affected paths.
:::

## Restricting uploadable file types

Shopware whitelists the file extensions that may be uploaded. Public and private filesystems have separate lists.

```yaml
shopware:
  filesystem:
    # ... adapter configuration ...
    allowed_extensions:          # Extensions allowed for the public filesystem
      - jpg
      - png
      # ...
    private_allowed_extensions:  # Extensions allowed for the private filesystem
      - pdf
      - zip
      # ...
```

Shopware ships with a sensible default list (common image, video, audio, and document formats; the private list additionally allows `zip`, `rar`, and `xml`). Override these keys only to add or remove specific extensions.

## Private file download strategy

For private files served from **local** storage (e.g. downloadable products and invoices), you can choose how the file is delivered to the client:

```yaml
shopware:
  filesystem:
    private_local_download_strategy: php   # php (default), x-sendfile, or x-accel
    private_local_path_prefix: ""          # used by the x-accel strategy
```

| Strategy        | Description                                                                                                                                                                                                                                       |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `php` (default) | Streamed through PHP as `application/octet-stream`. Works everywhere, but PHP handles the whole transfer.                                                                                                                                         |
| `x-sendfile`    | Apache offloads the file transfer. Requires the [`mod_xsendfile`](https://github.com/nmaier/mod_xsendfile) module.                                                                                                                                |
| `x-accel`       | Nginx offloads the transfer via internal redirect. Configure the matching `internal` location and set `private_local_path_prefix` accordingly. See the [Nginx X-Accel docs](https://www.nginx.com/resources/wiki/start/topics/examples/x-accel/). |

Offloading with `x-sendfile`/`x-accel` frees PHP-FPM workers during large downloads and is recommended for high-traffic shops that serve large private files.

## Advanced

### Tuning the S3 batch write size

When Shopware writes many files at once (for example, during `asset:install` or theme compilation), the S3 adapter batches the uploads. The batch size defaults to `250` and can be tuned:

```yaml
shopware:
  filesystem:
    batch_write_size: 250
```

### Add your own adapter

To support a storage backend Shopware does not ship with, create a Flysystem adapter (see the [official Flysystem guide](https://flysystem.thephpleague.com/docs/advanced/creating-an-adapter/)) and wrap it in an `AdapterFactory`:

```php
<?php

use Shopware\Core\Framework\Adapter\Filesystem\Adapter\AdapterFactoryInterface;
use League\Flysystem\FilesystemAdapter;

class MyFlysystemAdapterFactory implements AdapterFactoryInterface
{
    public function getType(): string
    {
        return 'my-adapter-prefix'; // Must match the `type` in the YAML config
    }

    public function create(array $config): FilesystemAdapter
    {
        // $config contains the `config` block from the YAML
        return new MyFlysystemAdapter($config);
    }
}
```

Register the class in the DI container with the tag `shopware.filesystem.factory` to make it usable as a `type`.

## Troubleshooting

**Media returns 404 after switching to S3.** The existing files were not copied to the new bucket, or the paths/`root` prefix don't match. Follow the [migration procedure](#migrating-an-existing-filesystem-to-a-new-adapter).

**Files load, but from the wrong (local) domain.** The `url` is not set (or is overridden by the fallback). Set the `url` of the affected filesystem to your bucket/CDN domain.

**Theme or plugin assets are missing after the switch.** Run `bin/console asset:install` and `bin/console theme:compile` so they are written to the new storage. Also check the [fallback behavior](#fallback-adapter-configuration).

**`MissingDependencyException` for the adapter.** Install the adapter package: `league/flysystem-async-aws-s3` for S3 or `league/flysystem-google-cloud-storage` for Google Cloud.

**S3-compatible provider (MinIO etc.) returns errors about the bucket host.** Set `use_path_style_endpoint: true` in the adapter `config`.
