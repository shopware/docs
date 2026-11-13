---
nav:
  title: Deploy over SSH
  position: 4

---

# Deploy over SSH

Shopware CLI can build your project, upload it to a server over SSH, and switch the shop to the new version without downtime. Every deployment is kept as a separate release on the server, so you can go back to an earlier one with a single command.

::: warning Experimental
The `project deploy` commands are experimental. Commands, configuration, and the server layout can still change, so do not use them for production shops yet. Try them on a test or staging environment and share your feedback by creating an issue in the [Shopware CLI repository](https://github.com/shopware/shopware-cli/issues).
:::

## How it works

A deployment has two halves. The build happens on your machine or in CI. The server only receives a finished archive, so it needs no Git, Composer, or Node.js.

```mermaid
flowchart LR
    subgraph local["Your machine or CI"]
        source["Project source"] -->|"deploy create"| archive["Release archive"]
    end
    subgraph server["Server"]
        unpack["Unpack as a new release"] --> link["Link shared data"]
        link --> helper["Run Deployment Helper"]
        helper --> switch["Switch the live symlink"]
    end
    archive -->|"deploy rollout (SSH)"| unpack
```

The current release keeps serving the shop until the last step. The switch itself replaces one symlink, so visitors see either the old release or the new one, never a half-updated shop.

The commands you will use:

| Command                   | What it does                                                     |
| ------------------------- | ---------------------------------------------------------------- |
| `project deploy init`     | One-time setup of a server: writes the runtime configuration.    |
| `project deploy create`   | Builds the project and stores a release archive locally.         |
| `project deploy rollout`  | Uploads an archive, prepares the release, and activates it.      |
| `project deploy list`     | Shows the releases that were rolled out and which one is active. |
| `project deploy logs`     | Prints the Deployment Helper output of a release.                |
| `project deploy rollback` | Switches back to a release that is still on the server.          |
| `project deploy prune`    | Removes old releases from the server.                            |

## Quick start

After you [configured the target](#configure-the-target), a first deployment takes two commands:

```bash
# Once per server: write the runtime configuration
shopware-cli project deploy init -e production

# For every deployment: build and roll out
shopware-cli project deploy create -e production --rollout
```

The rest of this page explains each step and the options behind it.

## Prerequisites

In the project:

- [Deployment Helper](../../../../guides/hosting/installation-updates/deployments/deployment-helper/index.md) installed as a production Composer dependency. The archive must contain `vendor/bin/shopware-deployment-helper`.
- A local or CI environment that can [build the project](build.md).

On the server:

- SSH access with a user that is the same user PHP runs as (web server or PHP-FPM). Files created during a deployment are then readable and writable by the shop.
- PHP CLI 8.4 or higher with the `phar` extension, the PHP extensions your project needs, and a writable temporary directory.
- `tar`.
- A database and database user reachable from the server, and a configured web server.
- A deployment directory writable by the SSH user.

## Configure the target

Run the commands on this page from your Shopware project. Add an environment to `.config/shopware-project.yml`:

```yaml
environments:
  production:
    type: ssh
    url: https://shop.example.com
    ssh:
      host: shop.example.com
      user: deploy
      directory: /var/www/shop/live
      php_binary: /usr/bin/php8.4
```

| Option                          | Meaning                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `host`                          | Host name or IP address of the server.                                       |
| `user`, `port`, `identity_file` | Connection settings. If omitted, your SSH configuration and SSH agent apply. |
| `directory`                     | Path of the **active symlink**, not of a regular directory. See below.       |
| `php_binary`                    | PHP binary used on the server. Defaults to `php`.                            |
| `php_args`                      | Extra arguments for that binary, for example `["-d", "memory_limit=512M"]`.  |

`directory` is the path that always points to the active release. Its parent, here `/var/www/shop`, holds everything the deployment stores and must be used for this deployment only. Configure the web server's document root as `/var/www/shop/live/public`.

The active path must not already be a real directory or file. Migrating an existing checkout requires moving its persistent data into the [shared layout](#server-layout) first. Try the workflow on a separate staging target before adopting an existing installation.

### Choose the environment

Pass the environment with `-e`. If you omit it in a terminal, the CLI asks which SSH environment to use. In CI and other non-interactive runs, `-e` is required.

## Initialize the server

Initialization is required once per server, before the first rollout:

```bash
shopware-cli project deploy init -e production
```

The form asks for the application URL and the database host, port, name, user, and password. For a new shop it can also collect the first-install values: locale, currency, and administrator credentials. You see a summary before anything is written.

Initialization stores the runtime configuration in `shared/.env.local` on the server and generates an `APP_SECRET` if none exists. The first-install values are stored separately and removed after the first successful Deployment Helper run.

Running the command again on an initialized server changes nothing. To change the configuration later, or to add your own environment variables, edit `shared/.env.local` on the server.

Initialization does not create the database, database user, web server configuration, background workers, or scheduled tasks. Its output lists the remaining setup steps.

### Initialize from CI

Supply JSON using `--init-config` to initialize without prompts:

```json
{
  "runtime_values": {
    "APP_URL": "https://shop.example.com",
    "DATABASE_URL": "mysql://shop:replace-me@127.0.0.1:3306/shop"
  },
  "install_values": {
    "INSTALL_ADMIN_PASSWORD": "replace-with-a-strong-password",
    "INSTALL_ADMIN_EMAIL": "admin@example.com"
  }
}
```

Store this as a protected file provided by your secret manager, then pass it on standard input so the values stay out of process arguments:

```bash
shopware-cli --no-interaction project deploy init -e production --init-config - < init.json
```

Do not commit this file. Unknown keys and invalid values are rejected before the server is touched.

| Section          | Keys                                                           | Notes                                                   |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `runtime_values` | `APP_URL`, `DATABASE_URL`                                      | Required. URL-encode the credentials in `DATABASE_URL`. |
| `runtime_values` | `APP_SECRET`                                                   | Generated when omitted and none exists on the server.   |
| `runtime_values` | `APP_ENV`, `APP_DEBUG`                                         | Default to `prod` and `0`.                              |
| `install_values` | `INSTALL_ADMIN_PASSWORD`                                       | Required when `install_values` is present.              |
| `install_values` | `INSTALL_LOCALE`, `INSTALL_CURRENCY`, `INSTALL_ADMIN_USERNAME` | Default to `en-GB`, `EUR`, and `admin`.                 |
| `install_values` | `INSTALL_ADMIN_EMAIL`, `SALES_CHANNEL_URL`                     | Optional.                                               |

Omit `install_values` entirely to skip the first-install setup, for example when the database already contains a shop.

## Build and roll out a release

Create an archive:

```bash
shopware-cli project deploy create -e production
```

The build runs in a temporary copy of the project, so your working directory is not modified. The archive gets a generated name such as `focused-wise-turing` and is stored in `.shopware-cli/deployments/`. Git metadata, local `.env` files, runtime data, and Composer credentials are not part of the archive. Creating the archive does not connect to the server.

Roll out the deployment using the name printed by the command:

```bash
shopware-cli project deploy rollout -e production focused-wise-turing
```

To build and deploy in one command:

```bash
shopware-cli project deploy create -e production --rollout
```

You can also choose an archive path and deploy that artifact later, for example in a separate CI job:

```bash
shopware-cli project deploy create -e production --output ./builds/release-001.tar.gz
shopware-cli --no-interaction project deploy rollout -e production ./builds/release-001.tar.gz
```

The file name without `.tar.gz` becomes the release name. It may contain letters, digits, dots, hyphens, and underscores, and is limited to 128 characters.

### What happens during a rollout

```mermaid
sequenceDiagram
    participant C as Shopware CLI
    participant S as Server
    participant V as Visitors

    Note over V,S: Current release keeps serving the shop
    C->>C: Show preview and ask for confirmation
    C->>S: Upload the archive (skipped if already cached)
    S->>S: Unpack into releases/<name>
    S->>S: Link shared files and directories
    S->>S: Run Deployment Helper (install or update, migrations)
    S->>S: Make the release read-only
    C->>S: Activate
    S->>S: Run pre hooks
    S->>S: Switch the live symlink
    S->>S: Reset PHP OPcache and run post hooks
    Note over V,S: New release serves the shop
    S-->>C: Done
```

Before confirmation, the CLI shows the local archive and the configured targets. This preview is built from your configuration only and does not check that the server is ready.

Without a deployment name, an interactive rollout offers the local archives to choose from. In CI, pass an explicit name or path together with `--no-interaction`, which skips the confirmation.

Use a new archive name for changed contents: a release name on the server is bound to its archive checksum. Rolling out the release that is already active and unchanged does nothing.

After the rollout, check the Storefront and Administration. Point workers and scheduled tasks at the active path, here `/var/www/shop/live`, and restart workers as part of your deployment, for example with [hooks](#run-commands-around-activation).

### When something fails

| Situation                                     | Result                                                                                 | What to do                                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Upload, unpacking, or Deployment Helper fails | The previous release stays active. The failed release and its logs stay on the server. | Read the logs with `project deploy logs`, fix the cause, and build with a new release name. |
| The connection drops before activation        | Nothing is activated. The server never switches without the CLI's confirmation.        | Run the rollout again.                                                                      |
| The connection drops during activation        | The state is unknown.                                                                  | Inspect the active path on the server before you retry.                                     |
| OPcache reset fails after the switch          | The new release stays active and a warning is printed.                                 | Reset the PHP cache yourself.                                                               |

::: warning Database changes remain
Deployment Helper runs migrations before the switch. They are not undone when the preparation fails afterwards or when you roll back. Keep schema changes compatible with the code versions you may need to restore.
:::

## Inspect and roll back

List the releases that were rolled out, or read a release's Deployment Helper output:

```bash
shopware-cli project deploy list -e production
shopware-cli project deploy list -e production --format json
shopware-cli project deploy logs -e production focused-wise-turing
```

Logs are also available for releases whose preparation failed. They can contain sensitive values printed by Deployment Helper.

To reactivate a release that is still on the server:

```bash
shopware-cli project deploy rollback -e production focused-wise-turing
```

Without a name, an interactive rollback offers the available releases. It does not need the local archive.

A rollback only switches the symlink back to the older code. It does not run Deployment Helper again and does not undo database migrations.

## Retain and prune releases

Releases stay on the server until you remove them. Preview the cleanup before deleting anything:

```bash
shopware-cli project deploy prune -e production --keep 5 --dry-run
shopware-cli project deploy prune -e production --keep 5
```

By default, the five most recent deployments are kept. The active release and failed or incomplete releases are never removed. Pruning also deletes cached archives that no release refers to anymore, and continues a cleanup that was interrupted earlier.

A pruned release is no longer available for rollback. Keep enough history for your recovery needs.

Rollout, rollback, and pruning share one lock per server, so only one of them runs at a time.

## Server layout

The deployment manages the parent of `ssh.directory`:

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

```mermaid
flowchart TD
    web["Web server document root<br/>/var/www/shop/live/public"] --> live["live (symlink)"]
    live -->|"points to the active release"| new["releases/focused-wise-turing<br/>read-only code"]
    old["releases/older-release<br/>kept for rollback"]
    new -->|".env.local, public/media, files, ..."| shared["shared/<br/>data that survives deployments"]
    old --> shared
    new -->|"var/cache"| cache["runtime/focused-wise-turing/cache<br/>writable cache of this release"]
```

| Path             | Content                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `live`           | The symlink configured as `ssh.directory`. The name is up to you.                        |
| `releases/`      | One directory per release. A release is read-only once it is prepared.                   |
| `shared/`        | Files and directories that every release uses, such as configuration and uploaded media. |
| `runtime/`       | The writable `var/cache` of each release.                                                |
| `.shopware-cli/` | Deployment metadata, logs, cached archives, and the lock.                                |

### Shared files and directories

The following paths are replaced in each release by links into `shared/`:

- Files: `.env.local`, `install.lock`, `public/.htaccess`, and `public/.user.ini`
- Directories: `config/jwt`, `files`, `var/log`, `public/media`, `public/plugins`, `public/thumbnail`, `public/sitemap`, and `public/theme`

If a shared path does not exist on the server yet, the copy from the release being deployed becomes the shared one. From then on, the shared copy wins. For example, a later change to `public/.htaccess` in your repository is not deployed. Change the file in `shared/` on the server, or remove it from the shared files.

To change the lists, set `ssh.shared.files` and `ssh.shared.directories`:

```yaml
environments:
  production:
    type: ssh
    ssh:
      host: shop.example.com
      directory: /var/www/shop/live
      shared:
        files:
          - .env.local
          - install.lock
        directories:
          - config/jwt
          - files
          - var/log
          - public/media
          - public/thumbnail
          - public/sitemap
          - public/theme
          - public/plugins
```

Each list replaces its defaults completely, and an empty list disables that category. Paths must be relative to the project, must not overlap, and must not include `var/cache`. Keep `.env.local` in the shared files, because that is where initialization writes the runtime configuration.

### Read-only releases

For security reasons, all files of a release are made read-only before it is activated. A compromised shop or Administration account cannot change the application code or place new code on the server this way.

As a consequence, extensions cannot be uploaded, installed from the Store, or updated in the Administration at runtime. Add extensions to the project instead, with Composer or in `custom/plugins`, and roll out a new release. Deployment Helper then installs and updates them during the rollout.

Only the shared paths and the cache of a release stay writable. Read-only releases do not replace operating-system isolation between deployment and runtime users.

## Run commands around activation

Hooks run on the server directly before and after the symlink switch, for example to stop and start workers:

```yaml
environments:
  production:
    type: ssh
    ssh:
      host: shop.example.com
      directory: /var/www/shop/live
      hooks:
        timeout_seconds: 120
        pre:
          - systemctl --user stop shopware-worker.target
        post:
          - systemctl --user start shopware-worker.target
```

- Each entry runs with `sh -eu` in the deployment directory, here `/var/www/shop`.
- Hooks also run on rollback. They do not run when the release is already active.
- A failing `pre` hook stops the activation. `post` hooks still run in that case, so workers stopped by a `pre` hook are started again.
- `timeout_seconds` limits each hook and defaults to 300. The server needs a `timeout` command that supports `--kill-after`, which most Linux servers provide.

## Reset PHP OPcache

PHP-FPM can keep serving cached code of the previous release after the switch. To reset its OPcache after activation, enable CacheTool on the SSH environment:

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
        fcgi: /run/php/php8.4-fpm.sock
```

The host needs `curl` with HTTPS support. The CLI downloads a pinned CacheTool PHAR and verifies its checksum. Choose the socket used by the web application's PHP-FPM pool, or omit `fcgi` to let CacheTool detect it.

The `web` adapter instead requires `web_url` and `web_path`. Its writable endpoint directory must be outside the active symlink and `releases/`; temporary endpoints are removed after use. `tmp_dir`, when configured, must also be outside those paths. Alternatively, `cachetool.config` references a native CacheTool configuration on the host and cannot be combined with inline adapter settings. With native web configuration, you are responsible for cleaning up temporary endpoints if CacheTool cannot fetch them.

A cache reset failure after activation reports a warning and does not undo the release switch.

::: warning Shared hosting process restart
When CacheTool is unset or disabled and the server's `hostname -f` is `de-nserver.de` or ends with `.de-nserver.de`, activation instead sends `SIGTERM` to other PHP processes owned by the SSH user. This can affect other shops and workers under the same account. The fallback refuses to run as `root`. Other hosts require their own PHP cache and worker restart strategy.
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

Every host keeps its own releases, runtime caches, active symlink, and deployment metadata. What the hosts must have in common depends on where the shop stores its files.

### Share data between hosts

The preferred setup is an S3-compatible object storage for the shop's public and private files. Configure it as described in the [filesystem guide](../../../../guides/hosting/infrastructure/filesystem.md). Media, thumbnails, sitemaps, theme files, and plugin assets then live in the bucket and not on the hosts. In that setup, only `shared/.env.local` has to be the same on all hosts, for example through a small network share or your configuration management.

Without object storage, the complete `shared/` directory must be on a filesystem that every host sees, such as a network share.

In both setups, create `shared/` and the configured shared directories on every host before initialization and rollout. A multi-host rollout does not create them. With object storage, they can be plain local directories; `var/log` then holds the logs of each host separately.

Database work must happen only once, so one host is the `migration_host`. A rollout then runs in phases:

```mermaid
sequenceDiagram
    participant C as Shopware CLI
    participant M as web1 (migration host)
    participant F as web2

    par Stage on every host
        C->>M: Upload, unpack, link shared data
    and
        C->>F: Upload, unpack, link shared data
    end
    C->>M: Run Deployment Helper once
    C->>F: Warm up the cache
    Note over C,F: Activation, one host after another in name order
    C->>M: Switch the live symlink
    C->>F: Switch the live symlink
```

Nothing is activated before every host is prepared. Initialization works the same way: it collects the configuration once, writes it through `migration_host`, and verifies that all hosts see the same runtime configuration.

::: warning Partial activation
Activation is not atomic across hosts. A failure stops subsequent switches and reports the state of each host. Inspect those states before recovery; the CLI does not automatically roll back the group.
:::

The other commands behave as follows:

- `rollback` requires the release with the same checksum on every host.
- `list` includes the host name of each entry.
- `logs` reads from the migration host.
- `prune` applies independently per host.

`host` and `hosts` are mutually exclusive. Multiple hosts require `migration_host`. `parallelism` is the number of hosts worked on at the same time; it defaults to two and has a maximum of 32. Host entries inherit the common connection settings and can override `user`, `port`, `directory`, `identity_file`, and `php_binary`. A host-specific `shared`, `cachetool`, or `hooks` block replaces the common block.

Host groups apply only to deployment commands. Use a separate single-host environment for general remote commands such as `project console`.
