---
nav:
  title: Staging Mode Integration
  position: 21

---

# Staging Mode Integration

In a staging environment, you usually want Shopware's staging mode to be re-applied every time the database is refreshed from production, so that emails remain disabled, app connections are reset, URLs are rewritten, and so on. The Deployment Helper can do this for you automatically.

Enable it either in `.shopware-project.yml`:

```yaml
deployment:
  staging:
    enabled: true
```

Or, via the environment variable `SHOPWARE_DEPLOYMENT_STAGING=1`. The latter is convenient when the same `.shopware-project.yml` is shared between production and staging. Set the env variable only on the staging environment.

When enabled, the Deployment Helper runs `system:setup:staging --no-interaction --force` as a `PostDeploy` event listener after extensions have been managed, for both the installation and update flows. To configure what staging mode actually changes (banners, URL rewriting, email delivery, ElasticSearch checks, etc.), see [Creating a Staging Instance](../creating-a-staging-instance.md#configuring-staging-mode).

:::warning
Do not enable this on your production environment. `system:setup:staging` is a destructive operation that, among other things, deletes apps with active external connections and disables email delivery.
:::

## Data migration from production

A common workflow is to copy the production database to staging periodically to test against real data. When you do this:

1. Copy the production database to the staging environment.
2. Deploy your Shopware codebase to the staging environment.
3. Enable staging mode in Deployment Helper or run it manually on deployment.

Staging mode then resets the copied database state (disables email, removes app connections, rewrites URLs, etc.) so your staging environment is isolated from production.

:::warning
**Do not** copy the production database without also enabling staging mode or running it manually. If you copy production data but skip staging setup, your staging environment will:

- Send emails to real customers when you test forms
- Leak data to production via app connections
- Show production URLs in links
- Report metrics to production analytics

This has caused real data leaks in the past. Always enable or run staging mode after a database copy.
:::

## Detecting environment mode

Shopware does not automatically detect whether an instance is staging or production. The system runs in whatever mode is configured. You must explicitly enable staging mode via:

- Environment variable: `SHOPWARE_DEPLOYMENT_STAGING=1`
- Or configuration: `deployment.staging.enabled: true` in `.shopware-project.yml`
- Or manual command: `bin/console system:setup:staging`

If you skip this step after copying production data, the instance behaves like production (real email, real app connections, production URLs). There is no automatic safeguard.

## App handling in staging

When staging mode runs (`system:setup:staging`), Shopware deletes all apps with active external connections to prevent:

- Staging instance sending data to production integrations
- Leaked customer information via third-party services
- Production webhooks receiving staging test events

After staging setup, you need to **reinstall apps** to create new instance IDs and app connections that point to staging/test environments.

Deployment Helper workflow for apps in staging:

1. Deploy code with apps configured in `custom/apps` or Composer
2. Enable staging: `export SHOPWARE_DEPLOYMENT_STAGING=1`
3. DH runs, installs apps
4. Post-deploy listener runs `system:setup:staging`, which deletes installed apps with external connections
5. On next deployment, apps are reinstalled with fresh instance IDs
6. Configure apps to use staging/test API keys and webhooks

This ensures staging is isolated from production systems.
