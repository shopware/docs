---
nav:
  title: Troubleshooting
  position: 24

---

# Deployment Helper Troubleshooting

This page highlights common failures when running `vendor/bin/shopware-deployment-helper run`, and provides guidance for resolving them. For the full command, configuration, and environment-variable reference, see [Deployment Helper](index.md).

## Getting more detail

`run` returns a non-zero exit code on failure and prints each step's output. Read the output above the failure to find the failing command, and re-run that Shopware console command directly (for example, `bin/console system:update:finish`) to see its full error.

## The deploy fails to reach the database

**Symptom:** the run ends with a database connection error, or `Could not connect to database`.

The helper waits for the database, retrying up to 10 times with a one-second pause between attempts. If it still cannot connect, it fails.

Check if:

- `DATABASE_URL` is correct and reachable from the deploy environment (host, port, credentials).
- the database service is actually up before the helper runs. In container setups, order startup so the database is ready, or add your own wait.
- TLS is required, and `DATABASE_SSL_CA` / `DATABASE_SSL_CERT` / `DATABASE_SSL_KEY` are set. Verify the certificate paths are correct and readable by the PHP process. To bypass server-certificate verification (non-production only), set `DATABASE_SSL_DONT_VERIFY_SERVER_CERT`. See [SSL/TLS Connection guide](../../../infrastructure/database.md#ssltls-connection) and [Environment variables](environment.md#environment-variables).

## A step times out on a large shop

**Symptom:** a step is killed after 300 seconds.

Each step has a timeout (default 300s). Raise or disable it:

```bash
vendor/bin/shopware-deployment-helper run --timeout=900
# or disable entirely:
vendor/bin/shopware-deployment-helper run --timeout=null
```

You can also set `SHOPWARE_DEPLOYMENT_TIMEOUT` in the environment. The `--timeout` option takes precedence.

## Theme and assets were not pre-built in CI/CD

The deployment artifact must already contain the compiled theme and installed assets. In CI/CD, build the artifact with `shopware-cli project ci` and deploy that output.

At deploy time, run Deployment Helper with the theme and asset steps skipped so it only consumes the pre-built artifact:

```bash
vendor/bin/shopware-deployment-helper run --skip-theme-compile --skip-assets-install
```

If the Storefront is missing assets after deployment, fix the CI build artifact or upload step. Do not compensate by compiling the theme or installing assets during deployment.

## An update ran, but `system:update:finish` did not

This is expected. The update-finish/migration step runs only when the Shopware version actually changed. If you redeploy the same version, that step is skipped by design. To force it, deploy an actual version change.

## A one-time task keeps running every deploy

A one-time task is only recorded as done after it **succeeds completely**. If it keeps running, it is failing partway through. Check the deploy output for its error:

```bash
# Inspect the execution status:
./vendor/bin/shopware-deployment-helper one-time-task:list
```

Returns a table showing which tasks completed, which failed, and when.

If the task's logic has already been applied manually, and you want to stop it from re-running:

```bash
./vendor/bin/shopware-deployment-helper one-time-task:mark <id>
```

To force a rerun (removes completion mark):

```bash
./vendor/bin/shopware-deployment-helper one-time-task:unmark <id>
```

## A one-time task times out

**Symptom:** task is killed after 300 seconds (5 minutes) and marked incomplete.

One-time tasks have a default timeout of 300 seconds. Large batch operations or database-heavy scripts can exceed this.

Increase the timeout:

```bash
vendor/bin/shopware-deployment-helper run --timeout=900
```

Or set environment variable:

```bash
export SHOPWARE_DEPLOYMENT_TIMEOUT=900
```

See [One-time task timeout](one-time-tasks.md#one-time-task-timeout) for details.

## A config setting seems to have no effect

Deployment Helper provides a configuration schema for `.shopware-project.yml`. Use it in your editor to validate the file while editing, so misspelled or misplaced keys are reported before deployment.

Check if:

- Your editor is using the schema and does not report any validation errors.
- The key is nested under the correct section, for example `deployment:`.
- You are editing the file the helper actually loads. If `SHOPWARE_PROJECT_CONFIG_FILE` or `--project-config` is set, that file wins over the auto-discovered one.
- A `.shopware-project.local.yml` is overriding your value. Local files merge on top of the base file. See [Local configuration overrides](configuration.md#local-configuration-overrides).

## Extensions aren't being installed or updated as expected

- Confirm `deployment.extension-management.enabled` is `true`.
- Check the extension isn't listed under `exclude`, or set to `state: ignore` / `inactive` in `overrides`.
- If extensions are managed by the Store or Administration instead, extension management may be intentionally disabled — reconcile the two so they don't fight. Prefer managing extensions from code (via Composer) or via the helper, not both. See [Store-installed plugins and conflicts](extensions.md#store-installed-plugins-and-conflicts).

## Store login or license refresh fails

App installation and license refresh need valid Store credentials and a license domain. Verify:

- `SHOPWARE_STORE_ACCOUNT_EMAIL` and `SHOPWARE_STORE_ACCOUNT_PASSWORD` (or `SHOPWARE_STORE_SHOP_SECRET`) are set.
- A license domain is set, via `deployment.store.license-domain` or `SHOPWARE_STORE_LICENSE_DOMAIN`.

## Fastly snippets aren't updating

Automatic snippet deployment during `run` only happens when:

- A `config/fastly` directory exists in the project, and
- `FASTLY_API_TOKEN` and `FASTLY_SERVICE_ID` are set, and
- `FASTLY_DISABLE_SNIPPET_UPDATE` is **not** set to `1`.

To manage snippets manually, use the `fastly:snippet:*` commands. See [Fastly integration](hosting.md#fastly-integration).

## Staging setup issues after database copy

**Symptom:** You copied the production database to staging, but tests are sending real emails or leaking data to production apps.

If you skipped the staging mode setup, your staging instance is running in production mode. After copying the database, you **must** enable staging mode:

    # Manually, once:
    ./bin/console system:setup:staging

    # Or, automatically on every deployment, set:
    export SHOPWARE_DEPLOYMENT_STAGING=1

    # .shopware-project.yml
    deployment:
      staging:
        enabled: true

See [Staging Mode Integration](staging.md) for details on what staging mode does.

## Cache clearing is not smart by default

**Symptom:** Cache is always cleared on deployment, even when nothing changed.

By default, Deployment Helper clears the cache only when it detects changes (plugin updates, theme changes, etc.). If you need to **always** clear the cache on every deployment, set:

```yaml
deployment:
  cache:
    always_clear: true
```

Conversely, if you want to control cache clearing yourself, omit this setting and it defaults to smart clearing.

## Need to completely reinstall

If an environment is broken beyond repair, force a clean `install` from scratch.

:::warning
Setting `SHOPWARE_DEPLOYMENT_FORCE_REINSTALL=1` triggers a fresh `install` with `--drop-database`. This destroys existing data! Only use it in disposable environments, never in production.
:::
