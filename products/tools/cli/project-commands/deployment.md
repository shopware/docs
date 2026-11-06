---
nav:
  title: Deploy over SSH
  position: 4

---

# Deploy over SSH

Shopware CLI can build a project locally and deploy the resulting archive to one or more SSH hosts. It prepares each release before switching the active symlink, and keeps previous releases available for rollback.

## Prerequisites

- A Shopware project with [Deployment Helper](../../../../guides/hosting/installation-updates/deployments/deployment-helper/index.md) installed as a production Composer dependency. The archive must contain `vendor/bin/shopware-deployment-helper`.
- A local or CI environment that can [build the project](build.md).
- SSH access to a server with PHP CLI, the PHP extensions required by your project, and `tar`.
- A database and database user reachable from the server, and a configured web server.
- A deployment directory writable by the SSH user.

The remote host does not need Git, Composer, Node.js, or an installed Shopware CLI. Deployment Helper runs from the uploaded archive.

## Configure the target

Run these commands from your Shopware project. Add an environment to `.config/shopware-project.yml`:

```yaml
environments:
  production:
    type: ssh
    url: https://shop.example.com
    ssh:
      host: shop.example.com
      user: deploy
      directory: /var/www/shop/live
      php_binary: /usr/bin/php8.3
```

Choose a PHP binary compatible with your Shopware version. If omitted, `php_binary` defaults to `php`. SSH options can also include `port` and `identity_file`; connection defaults can come from your SSH configuration.

Here, `directory` is the path of the **active symlink**. Its parent, `/var/www/shop`, holds the release directories and persistent data. Configure the web server's document root as `/var/www/shop/live/public`.

The active path must not already be a real directory or file. Migrating an existing checkout requires moving its persistent data into the shared layout first. Try the workflow on a separate staging target before adopting an existing installation.

Use `-e production` explicitly: the default environment is `local`, which does not support SSH deployment.

## Initialize runtime configuration

```bash
shopware-cli project deploy init -e production
```

The form collects the application URL, database connection, and runtime settings. It can also collect first-install values such as the administrator credentials, locale, and currency.

Initialization writes runtime configuration to `shared/.env.local` and stores first-install values separately. Those installation values are removed after the first successful Deployment Helper run. Add custom runtime environment variables to `shared/.env.local`.

Initialization does not create the database, database user, web server configuration, background workers, or scheduled tasks. Its output lists the remaining setup steps.

### Initialize from CI

Supply JSON using `--init-config` to initialize without prompts:

```json
{
  "runtime_values": {
    "APP_URL": "https://shop.example.com",
    "DATABASE_URL": "mysql://shop:replace-me@127.0.0.1:3306/shop"
  }
}
```

Store this as a protected file provided by your secret manager, then run:

```bash
shopware-cli --no-interaction project deploy init -e production --init-config - < init.json
```

Do not commit this file. `APP_URL` and `DATABASE_URL` are required. The supported runtime keys are `APP_URL`, `DATABASE_URL`, `APP_SECRET`, `APP_ENV`, and `APP_DEBUG`; the last two default to `prod` and `0`.

If no application secret exists and you omit `APP_SECRET`, initialization generates one.

An optional `install_values` object accepts `INSTALL_LOCALE`, `INSTALL_CURRENCY`, `INSTALL_ADMIN_USERNAME`, `INSTALL_ADMIN_PASSWORD`, `INSTALL_ADMIN_EMAIL`, and `SALES_CHANNEL_URL`. When supplied, it requires an administrator password. Locale, currency, and username default to `en-GB`, `EUR`, and `admin`.

## Build and roll out a release

Create an archive:

```bash
shopware-cli project deploy create -e production
```

The build runs in a temporary copy of the project and stores a named archive in `.shopware-cli/deployments/`. Creating the archive alone does not connect to the remote host.

Use the deployment name printed by the command:

```bash
shopware-cli project deploy rollout -e production focused-wise-turing
```

Before confirmation, the CLI shows the local artifact and the configured remote targets. This preview does not check remote readiness. During rollout, the CLI uploads the archive, prepares the release, links persistent data, and runs Deployment Helper. It then makes the release read-only and switches the active symlink.

To build and deploy in one command:

```bash
shopware-cli project deploy create -e production --rollout
```

You can also choose an archive path and deploy that artifact later:

```bash
shopware-cli project deploy create -e production --output ./builds/release-001.tar.gz
shopware-cli --no-interaction project deploy rollout -e production ./builds/release-001.tar.gz
```

Use a new archive name for changed contents: a retained release name is bound to its archive checksum. Reusing an already active, unchanged release is a no-op.

Without a reference, interactive rollout offers local archives to choose from. In CI, pass an explicit name or path and `--no-interaction`, which skips confirmation.

After rollout, check the Storefront and Administration. Configure workers and scheduled tasks to use the active release path, and arrange worker restarts as part of your deployment process.

## Inspect and roll back

List successful retained rollouts or retrieve a release's Deployment Helper output:

```bash
shopware-cli project deploy list -e production
shopware-cli project deploy list -e production --format json
shopware-cli project deploy logs -e production focused-wise-turing
```

Logs are also available for failed preparations. To reactivate a retained release:

```bash
shopware-cli project deploy rollback -e production focused-wise-turing
```

Without a name, interactive rollback offers eligible remote releases. It does not require a local archive.

::: warning Database changes remain
Rollback switches application code to a retained release. It does not run Deployment Helper again or undo database migrations. Database changes may already have happened even if preparation failed before activation. Keep schema changes compatible with the code versions you may need to restore.
:::

If preparation fails, the active release stays in place and the failed release and logs remain for inspection. After correcting the cause, build with a new release name. If activation is interrupted, inspect the active path before retrying.

## Retain and prune releases

Preview cleanup before deleting old releases:

```bash
shopware-cli project deploy prune -e production --keep 5 --dry-run
shopware-cli project deploy prune -e production --keep 5
```

The default retention is five distinct recent deployments. Pruning also protects the active release, failed releases, and incomplete releases, and can resume interrupted cleanup. It uses the same deployment lock as rollout and rollback.

A pruned release is no longer available for rollback. Keep enough history for your recovery needs.

## Persistent data and permissions

The target has the following layout:

```text
/var/www/shop/
├── live -> releases/focused-wise-turing
├── releases/
│   └── focused-wise-turing/
├── shared/
│   ├── .env.local
│   └── public/media/
├── runtime/
│   └── focused-wise-turing/cache/
└── .shopware-cli/
```

Releases are read-only after preparation. Persistent files and directories are linked from `shared/`; `var/cache` uses a separate writable directory per release and host.

Default shared files are `.env.local`, `install.lock`, `public/.htaccess`, and `public/.user.ini`. Default shared directories are `config/jwt`, `files`, `var/log`, `public/media`, `public/plugins`, `public/thumbnail`, `public/sitemap`, and `public/theme`.

Configure replacements under `ssh.shared.files` and `ssh.shared.directories`. Each explicit list replaces its defaults; an empty list disables that category. Paths must be relative to the project, must not overlap, and must not include `var/cache`. Initialization requires `.env.local` among the shared files.

Ensure the web server and workers can read the release and runtime configuration, and write to the shared and runtime paths they need. Read-only releases do not replace operating-system isolation between deployment and runtime users.

## Reset PHP OPcache

To reset PHP-FPM's OPcache after activation, enable CacheTool on the SSH environment:

```yaml
environments:
  production:
    type: ssh
    ssh:
      host: shop.example.com
      user: deploy
      directory: /var/www/shop/live
      cachetool:
        enabled: true
        adapter: fcgi
        fcgi: /run/php/php8.3-fpm.sock
```

The host needs `curl` with HTTPS support. The CLI downloads a pinned CacheTool PHAR and verifies its checksum. Choose the socket used by the web application's PHP-FPM pool.

The `web` adapter instead requires `web_url` and `web_path`. Its writable endpoint directory must be outside the active symlink and `releases/`; temporary endpoints are removed after use. `tmp_dir`, when configured, must also be outside those paths. Alternatively, `cachetool.config` references a native CacheTool configuration on the host and cannot be combined with inline adapter settings. With native web configuration, you are responsible for cleaning up temporary endpoints if CacheTool cannot fetch them.

A cache reset failure after activation reports a warning and does not undo the release switch.

::: warning Shared hosting process restart
When CacheTool is unset or disabled and the server's `hostname -f` contains `de-nserver.de`, activation instead sends `SIGTERM` to other PHP processes owned by the SSH user. This can affect other shops and workers under the same account. The fallback refuses to run as `root`. Other hosts require their own PHP cache and worker restart strategy.
:::

## Deploy to multiple hosts

Replace `ssh.host` with named `ssh.hosts` entries:

```yaml
environments:
  production:
    type: ssh
    ssh:
      user: deploy
      directory: /var/www/shop/live
      migration_host: web1
      parallelism: 2
      hosts:
        web1:
          host: web1.example.com
        web2:
          host: web2.example.com
```

Provision the persistent shared paths on a filesystem visible to every host before initialization and rollout. Releases, runtime caches, the active symlink, and deployment metadata stay local to each host.

Initialization collects configuration once, writes through `migration_host`, and verifies that all hosts see the same runtime configuration. During rollout:

1. Each host stages the archive.
2. Deployment Helper runs once on `migration_host`.
3. The other hosts warm their caches.
4. Hosts activate sequentially in name order.

::: warning Partial activation
Activation is not atomic across hosts. A failure stops subsequent switches and reports the state of each host. Inspect those states before recovery; the CLI does not automatically roll back the group.
:::

Rollback requires the same retained release checksum on every host. Listing includes host names, logs come from the migration host, and pruning applies independently per host.

`host` and `hosts` are mutually exclusive. Multiple hosts require `migration_host`. `parallelism` defaults to two and has a maximum of 32. Host entries inherit common connection settings; a host-specific `shared` or `cachetool` block replaces the common block.

Host groups apply only to deployment commands. Use a separate single-host environment for general remote commands such as `project console`.
