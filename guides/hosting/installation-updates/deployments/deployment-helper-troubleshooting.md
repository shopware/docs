---
nav:
  title: Deployment Helper Troubleshooting
  position: 20

---

# Deployment Helper Troubleshooting

This page highlights common failures when running `shopware-deployment-helper run`, and provides guidance for resolving them. For the full command, configuration, and environment-variable reference, see [Deployment Helper](deployment-helper.md).

## Getting more detail

`run` returns a non-zero exit code on failure and prints each step's output. Read the output above the failure to find the failing command, and re-run that Shopware console command directly (for example, `bin/console system:update:finish`) to see its full error.

## The deploy fails to reach the database

**Symptom:** the run ends with a database connection error, or `Could not connect to database`.

The helper waits for the database, retrying up to 10 times with a one-second pause between attempts. If it still cannot connect, it fails.

Check if:

- `DATABASE_URL` is correct and reachable from the deploy environment (host, port, credentials).
- the database service is actually up before the helper runs. In container setups, order startup so the database is ready, or add your own wait.
- TLS is required, and `DATABASE_SSL_CA` / `DATABASE_SSL_CERT` / `DATABASE_SSL_KEY` are set. To bypass server-certificate verification (non-production only), set `DATABASE_SSL_DONT_VERIFY_SERVER_CERT`. See [Environment variables](deployment-helper.md#environment-variables).

## A step times out on a large shop

**Symptom:** a step is killed after 300 seconds.

Each step has a timeout (default 300s). Raise or disable it:

```bash
vendor/bin/shopware-deployment-helper run --timeout=900
# or disable entirely:
vendor/bin/shopware-deployment-helper run --timeout=null
```

You can also set `SHOPWARE_DEPLOYMENT_TIMEOUT` in the environment. The `--timeout` option takes precedence.

## Theme or asset steps are slow or redundant in CI/CD

If your CI build already compiled the theme and installed assets (via `shopware-cli project ci`), skip those steps at deploy time:

```bash
vendor/bin/shopware-deployment-helper run --skip-theme-compile --skip-assets-install
```

Only skip them if the build genuinely produced them. Otherwise, the storefront will be missing compiled assets.

## An update ran, but `system:update:finish` did not

This is expected. The update-finish/migration step runs only when the Shopware version actually changed. If you redeploy the same version, that step is skipped by design. To force it, deploy an actual version change.

## A one-time task keeps running every deploy

A one-time task is only recorded as done after it succeeds. If it keeps running, it is failing partway through. Check the deploy output for its error:

- Inspect state: `one-time-task:list`.
- If the task's effect is already applied and you want to stop it: `one-time-task:mark <id>`.
- To force a rerun: `one-time-task:unmark <id>`.

## A config setting seems to have no effect

Unrecognized keys in `.shopware-project.yml` are ignored silently. Check:

- The key is spelled correctly and nested under `deployment:`.
- You are editing the file the helper actually loads. If `SHOPWARE_PROJECT_CONFIG_FILE` or `--project-config` is set, that file wins over the auto-discovered one.
- A `.shopware-project.local.yml` isn't overriding your value (local files merge on top of the base). See [Local configuration overrides](deployment-helper.md#local-configuration-overrides).

## Extensions aren't being installed or updated as expected

- Confirm `deployment.extension-management.enabled` is `true`.
- Check the extension isn't listed under `exclude`, or set to `state: ignore` / `inactive` in `overrides`.
- If extensions are managed by the Store or Administration instead, extension management may be intentionally disabled — reconcile the two so they don't fight. Prefer managing extensions from code (via Composer) or via the helper, not both. See [Extension management and Store-installed plugins](deployment-helper.md#extension-management-and-store-installed-plugins).

## Store login or license refresh fails

App installation and license refresh need valid Store credentials and a license domain. Verify:

- `SHOPWARE_STORE_ACCOUNT_EMAIL` and `SHOPWARE_STORE_ACCOUNT_PASSWORD` (or `SHOPWARE_STORE_SHOP_SECRET`) are set.
- A license domain is set, via `deployment.store.license-domain` or `SHOPWARE_STORE_LICENSE_DOMAIN`.

## Fastly snippets aren't updating

Automatic snippet deployment during `run` only happens when:

- A `config/fastly` directory exists in the project, and
- `FASTLY_API_TOKEN` and `FASTLY_SERVICE_ID` are set, and
- `FASTLY_DISABLE_SNIPPET_UPDATE` is **not** set to `1`.

To manage snippets manually, use the `fastly:snippet:*` commands (see [Fastly integration](deployment-helper.md#fastly-integration)).

## Need to completely reinstall

If an environment is broken beyond repair, force a clean install from scratch.

:::warning
Setting `SHOPWARE_DEPLOYMENT_FORCE_REINSTALL=1` triggers a fresh install with `--drop-database`. This destroys existing data! Only use it on disposable environments, never on production.
:::
