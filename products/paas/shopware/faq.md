---
nav:
  title: Frequently Asked Questions
  position: 50
---

# Frequently Asked Questions

## Getting started and access

### How is my organization created?

Your organization is provisioned for you after your contract is in place. It is created against an identity that has accepted membership of your company in the Shopware Business Platform, so the nominated first administrator must have a Shopware account and must accept that invitation before provisioning can complete.

Once the organization exists, install the CLI, authenticate with `sw-paas auth`, and confirm your role with `sw-paas account whoami`.

### How do I add other people to my organization?

Two routes, both in [Adding users to the Organization](./guides/adding-users.md):

- **The administrator adds them.** The new user runs `sw-paas account whoami` and shares their `sub`; an administrator runs `sw-paas account user add`.
- **The user requests access.** They run `sw-paas account user request` with the organization ID, and an administrator approves it with `sw-paas account user requests resolve`.

:::info
Email-based invitations are not supported yet. Both routes require the new user to already have an account and to install the CLI first, because they are identified by their `sub` rather than by an email address. Invitation by email is planned.
:::

Roles exist at organization, project and application level, so an agency or an extension vendor can be given access to a single application rather than the whole organization.

### How does the platform get access to my repository?

Create the project with `--create-ssh-key` and add the generated public key to your repository as a read-only deploy key. See [How to set up repository access](./guides/setting-up-repository-access.md).

### Can a partner agency have its own organization?

Yes. Agencies can have their own organization for development and testing work that is not tied to a specific customer. Reach out to your partner manager at Shopware for details.

### Can an access token be restricted to a single application?

Not at present. A token inherits the permissions of the user who created it, and application-level scoping is not yet available. Keep this in mind when sharing tokens with third parties. For CI/CD, prefer a service account with scoped grants over a personal token — see [Account](./fundamentals/account.md).

## Platform and architecture

### Where does my application run?

On AWS in the `eu-central-1` region (Frankfurt). Other regions are not currently available.

### Is Shopware PaaS Native available on Azure or Google Cloud Platform?

No, Shopware PaaS Native currently runs on AWS only.

### Can I run multiple brands or shops from one setup?

Shopware's own sales channel and multi-store capabilities work as they do anywhere else. What the platform does not provide is a multi-client management layer across separate applications — each application is a separate Shopware installation with its own database and object storage.

### Is it possible to write to the local filesystem?

No, all containers are stateless, and local file writes are discouraged. Persistent storage must use S3 buckets or other external storage solutions.
Changes to the filesystem and Shopware code must be made directly in the Git repository.

### Can I customize the infrastructure (e.g., change web server configurations)?

No, the infrastructure is opinionated and pre-configured. Customizations at the server level are not allowed.

### Can I change PHP settings such as upload size or execution time?

Yes, through environment variables in [`application.yaml`](./fundamentals/application-yaml.md). The platform builds on the official Shopware Docker image, so settings such as `PHP_MAX_UPLOAD_SIZE` and `PHP_MAX_EXECUTION_TIME` can be set that way. See [PHP settings](./fundamentals/php-settings.md) for the full list.

`PHP_SESSION_HANDLER` is managed by the platform and must not be changed.

### Can I run different applications like Node.js?

General custom applications are not supported.
Composable frontends are supported as a dedicated application kind and can use a Node.js runtime.
See [Composable Frontends](./composable-frontends/index.md) for details.

### Can I host my custom applications?

General custom applications are not currently supported.
Composable frontends are supported as a dedicated application kind and can use a Node.js runtime.
Other decoupled storefront hosting scenarios will be evaluated based on customer needs.

### How many projects or applications can I create?

The available number depends on the booked plan for your organization. For what the Shopware plans include more broadly, see the [feature comparison](https://docs.shopware.com/en/shopware-6-en/features).

## Deployments

### What is the difference between a build and a deployment?

They are two separate steps with two separate lifecycles, and understanding the split is what makes controlled releases possible.

A **build** turns a commit into a runnable image. It installs Composer dependencies, compiles assets and produces an artifact that is stored and kept. Builds are where most of the time goes and where most failures happen, and they do not touch your running application at all.

A **deployment** takes an existing build and puts it live. It runs your database migrations, then rolls the new version out. This is the part that affects production.

```sh
sw-paas application build start     # build only, nothing goes live
sw-paas application build list      # see the builds you have available
sw-paas application deploy create   # pick a build and deploy it
```

`sw-paas application update` is a convenience that runs both in sequence.

**In practice this means you can build on Friday and deploy on Monday.** The build is prepared and verified ahead of time, and the release itself becomes a short, predictable step that you run in a quiet window. It also means a failed build is a non-event — production keeps serving the build it already has.

Two things to keep in mind:

- **Migrations run at deploy time, not build time.** Building ahead does not pre-run any schema change, so the migration risk sits entirely in the deployment window.
- **Any successful build can be deployed**, including an older one. That is what makes rollback by redeploy possible.

### Are deployments zero downtime?

Deployments use Kubernetes rolling updates and are zero downtime **when no database migrations are involved**.

When a deployment includes migrations, zero downtime cannot be guaranteed. Schema changes can temporarily break compatibility with the code still serving traffic, which may cause errors or instability while the deployment runs. Plan migrations carefully, particularly in production.

### In what order do deployment steps run?

Database migrations run first. After that, the remaining deployment flow is handled by the [deployment helper](../../../guides/hosting/installation-updates/deployments/deployment-helper#execution-flow).

### Can I configure pre-deployment and post-deployment hooks?

Yes. Use the [deployment helper](../../../guides/hosting/installation-updates/deployments/deployment-helper#configuration) to define deployment hooks.

### How can I connect my already deployed application to a new branch?

The application that you create is linked to a commit SHA and not to a branch. You can change the existing application commit SHA by running `sw-paas application update`. What matters is the commit configured for a given application.

### Where can I see the status of my PaaS application update?

You can see the status of your PaaS application by running `sw-paas application list`. This command shows the current status of your application, including whether the update was successful or if it's still in progress. To monitor all real-time events associated with the project and its applications run `sw-paas watch` this provides a live stream of events and is especially useful for tracking the progress of an ongoing update.

### Can I roll back a deployment?

You can point the application at an earlier commit with `sw-paas application update --commit-sha <sha>`, or redeploy an existing build with `sw-paas application deploy create --application-build-id <build-id>`.

Three limits to be aware of:

- **Database migrations are forward-only.** Redeploying earlier code does not undo migrations that have already run, and running older code against a migrated schema is untested. Check `sw-paas application deploy logs` to see whether a deployment ran migrations.
- **Recovering from a failed deployment is not self-service.** If a deployment has failed and left the application in a broken state, the PaaS infrastructure team has to intervene. Automated rollback is in development.
- **If you force push and lose your git history**, the earlier commits are no longer available to deploy.

Create a snapshot before a risky deployment so you have a restore point for your data as well as your code.

:::info
Automated rollback is in development. This answer will be replaced by a dedicated guide once it is available.
:::

### What do I need to do when upgrading Shopware?

A Shopware version upgrade needs two console commands around the deployment, in addition to the usual code update:

1. Update `shopware/core` in `composer.json`, run `composer update --no-scripts` and `composer recipes:update`, then commit and push.
2. **Before deploying**, prepare the running application: `sw-paas exec --new` → `bin/console system:update:prepare`
3. Deploy the upgrade commit with `sw-paas application update --commit-sha <sha>`
4. **After the deployment succeeds**, finish the update: `sw-paas exec --new` → `bin/console system:update:finish`

Steps 2 and 4 are mandatory. Skipping them does not produce an error — it produces a half-finished upgrade. Take a snapshot before you start, and confirm the previous deployment succeeded before beginning. See [Update Shopware in PaaS Native](./guides/update-shopware.md).

### Can I automate deployments from CI/CD?

Yes. The CLI runs non-interactively and authenticates machine-to-machine, so builds and deployments can be triggered from any pipeline.

Authenticate with a **service account**, not a personal access token — a personal token carries the full permissions of the person who created it, while a service account is scoped to the grants you give it. Creating service accounts, grants and tokens is covered in [Account](./fundamentals/account.md#service-accounts).

Note the scoping caveat documented there: a strictly scoped token should address resources with `--organization-id`, `--project-id` and `--application-id`, because the name-based options resolve through list API calls that the token may not be permitted to make.

:::info
A worked pipeline example (GitHub Actions, GitLab CI) is not yet part of this documentation. A guide is in preparation.
:::

### Can my build contact external services?

Yes. Builds run as regular Docker builds and can contact external endpoints when required, for example configured Composer repositories.

### Can I promote a development application to production myself?

Not at present. Promoting an application to production is performed by the Shopware infrastructure team.

### What does a composable frontend application have to provide?

A `kind: cfe` application must meet three runtime contracts, and none of them is checked at build time:

- Listen on **port 3000**
- Expose a health endpoint at **`/api/healthz`** that returns success when ready
- Write any runtime temporary files to **`/app/tmp`** — the container filesystem is read-only

If the port or the health endpoint is missing, the build succeeds, and the deployment then fails readiness, so the application never serves. Writing to disk at runtime fails only under real traffic.

If you use a custom Dockerfile via `app.build.dockerfile_path`, it must run as non-root with `UID` and `GID` set to `1000`.

See [Composable Frontends](./composable-frontends/index.md) for the full setup — [Runtime requirements](./composable-frontends/index.md#runtime-requirements), [Custom Dockerfile](./composable-frontends/index.md#custom-dockerfile), and the sections on environment variables, Fastly and ISR caching.

## Extensions

### How do I check whether an extension works on PaaS Native before deploying?

There is no automated compatibility check. An extension must support S3-compatible object storage and must not rely on writes to the local filesystem. Extensions that assume a persistent local disk will not work.

### How do I check whether an extension is actually installed and active?

A successful deployment does not confirm this. A green deployment means the build, the migrations, the deployment helper and the rollout all succeeded — it does not tell you what happened to an individual extension.

To check, open a session and use the Shopware console:

```bash
sw-paas exec --new
bin/console plugin:list
```

### How do I completely remove an extension?

The mechanism is the deployment helper's `state: remove`, documented under [Removing an extension](../../../guides/hosting/installation-updates/deployments/deployment-helper/extensions.md#removing-an-extension). What is specific to PaaS Native is that it takes **two deployments, in this order**:

1. **Uninstall.** Set the extension's state to `remove` in `.shopware-project.yml`, push, and run `sw-paas application update`. Confirm with `bin/console plugin:list` that it is uninstalled.
2. **Remove the code.** Run `composer remove <vendor>/<plugin>`, delete the override entry, push and deploy again.

**The order cannot be reversed.** An extension's uninstall routine is part of its own code. If you delete the package first, that routine no longer exists, and Shopware is left holding a registered extension it cannot load plus data it has no instructions for removing. Nothing fails visibly at the time — the problem usually surfaces during a later, unrelated upgrade.

Set `keepUserData: true` if you want the extension's data preserved; omitting it deletes that data during uninstall.

Removing an extension does not cancel any paid subscription for it. Licences are managed in your Shopware Account.

### My build fails on a private or paid extension. Why?

Private Composer packages and paid extensions need their credentials available at **build time**. Store `SHOPWARE_PACKAGES_TOKEN`, or `COMPOSER_AUTH` for other private repositories, in the vault as a `buildenv` secret. Runtime secrets are not available during the build. See [Using the Vault](./guides/secrets-vault-guide.md).

### Why do I see "Runtime extension management is disabled" when trying to purchase extensions in the admin?

When trying to purchase an extension via the in-app store, the admin shows the error "Runtime extension management is disabled." Even after setting `runtime_extension_management: true` in `config/packages/z-shopware.yaml` and deploying, the error will persist.

This behavior is intentional. Runtime extension management is deliberately disabled in the Shopware Admin UI when using PaaS due to its ephemeral nature and cannot be enabled by changing the `runtime_extension_management` configuration.

To use the in-app extension store, the `SwagExtensionStore` plugin must be installed via Composer. Once this extension is installed, the Shopware Admin can connect to the extension store and allow in-app purchases.

## Data, backups and recovery

### Can I access the database directly?

Yes, through a CLI tunnel:

```bash
sw-paas open service --service database --port 3306
```

Then connect with any MySQL client against the local port. There is no public database endpoint — direct exposure is not supported. See [Databases](./resources/databases.md), and note the network considerations in [Known issues](./known-issues.md).

### Which MySQL versions are supported, and can I change version later?

MySQL `8.0` and `8.4` are available and configured in [`application.yaml`](./fundamentals/application-yaml.md).

Upgrading from `8.0` to `8.4` **cannot be reversed**. Before switching, confirm that your Shopware version supports MySQL 8.4 — not every version does, and an incompatible combination can cause migrations to fail with no route back.

### How often are backups taken, and how long are they kept?

For databases, the platform creates one full snapshot per day within a backup window of 01:00–02:00 UTC, and maintains a continuous backup with point-in-time recovery. Object storage buckets have continuous backup enabled.

Backups are retained for **7 days**, for both databases and object storage buckets.

You can restore a database to any point in time between five minutes ago and seven days ago. For object storage, the recovery point objective is approximately 30 minutes, so the most recent state available for restore may be up to 30 minutes before the incident.

### Who performs a restore — can I do it myself?

It depends on which kind of restore you need.

**Snapshots are self-service.** You can create, list, download and restore your own snapshots with the `sw-paas snapshot` commands. A snapshot contains the database and the object storage content of a deployment, which makes it the right tool for taking a restore point before a risky change. See [Snapshots](./fundamentals/snapshots.md).

**Point-in-time recovery from platform backups is performed by Shopware.** Open a support ticket stating the application and the target point in time.

In both cases, restoring **overwrites the target and discards everything written since that point**. To read older data while production continues to run, restore a snapshot onto a separate application instead.

### What exactly is copied when I clone an application?

The database and the object storage content are copied. The code is not — the target application keeps its own commit, which is why it must already exist and be on the same commit as the source.

After cloning, you must adjust the storefront domains on the sales channel and the admin credentials manually, as both arrive from the source application.

### Are database copies anonymized when cloning an application?

No. Cloning restores an exact copy of the source application's database and object storage data, including customer data. Anonymization is not currently supported.

### I created a snapshot but `snapshot list` does not show it

Snapshots are tied to a specific deployment, and `snapshot list` shows the snapshots of the current deployment only. If a new deployment has been applied in the meantime, a snapshot created against the previous one will not appear.

Pass the deployment explicitly to find it, using the deployment ID that was shown when the snapshot was created:

```bash
sw-paas snapshot list --deployment-id <deployment-id>
```

### Do I stay in control of my code and data?

Yes, entirely. Nothing about running on PaaS Native puts your shop behind a door we hold the key to.

**Your code stays yours.** It lives in your own Git repository, on your own provider. Shopware is open source, so the application running here is the same application that runs anywhere else — there is no PaaS-only fork of Shopware.

**Your data is yours on demand.** `sw-paas snapshot create` followed by `sw-paas snapshot download-url` gives you an archive with your database dump and both object storage buckets, in standard formats. Self-service, whenever you want it, no ticket and no notice period.

The one platform-specific piece is configuration. A codebase prepared for PaaS Native pulls in the `shopware/k8s-meta` package, which wires up object storage, cache, cluster mode and production settings for this environment. Running somewhere else means swapping that for the equivalent configuration there — a known, bounded piece of work.

We would rather keep your business by being worth staying on than by making it hard to leave.

## Domains and CDN

### How do I point a custom domain at my application?

**Configure DNS first and wait for it to propagate.** The platform validates your DNS in real time when you create the domain and will reject it otherwise.

- **Subdomain** — one `CNAME` to `cdn.shopware.shop`
- **Apex domain** — four `A` records, four `AAAA` records, plus a `TXT` record proving ownership. A `CNAME` on an apex domain is invalid DNS and will not work.

Then create the domain with `sw-paas domain create`, deploy to activate it, and associate it with your storefront in the Shopware Admin.

The exact record values, the ownership challenge format and `dig` commands to verify propagation are in [CDN](./cdn/index.md#custom-domains).

### Can I redirect www to my apex domain?

Yes, with custom Fastly VCL snippets in your own repository. Both domains must be registered on the application first.

A redirect needs **two snippets**: one in the `recv` subroutine to catch the request and raise a synthetic error, and one in the `error` subroutine to return the 301. See [Fastly Snippets](./cdn/fastly-snippets.md) for the folder layout and naming rules — note that file names may not contain underscores, and the directory must be exactly one level deep.

## Migrating to PaaS Native

### What has to change in my codebase before it can run on PaaS Native?

Less than people expect. It stays a normal Shopware project — the changes are about making it stateless and telling the platform how to run it. See [Prepare Shopware codebase](./get-started/prepare-codebase.md) for the full procedure.

**Two files you add:**

- `composer require shopware/k8s-meta` brings the platform configuration — S3 filesystems, Redis cache and sessions, cluster mode, disabled admin worker, JSON logging to stderr. See [K8s Meta Package](./fundamentals/k8s-meta.md).
- `application.yaml` at the project root declares your PHP version, environment variables and services. See [Application YAML](./fundamentals/application-yaml.md).

**Three habits you change:**

- **Extensions are installed through Composer only.** Plugin management in the Admin is not available, because every instance has to be identical and stateless.
- **Nothing writes to local disk.** Anything that stores files must go through Shopware's filesystem abstraction onto S3. This is usually the real work in a migration, and it applies to your own code and to any extension you depend on.
- **Check your extensions support S3-based storage** before you commit to them. There is no automated compatibility check.

Custom steps around deployment are configured as [deployment helper](../../../guides/hosting/installation-updates/deployments/deployment-helper#configuration) hooks rather than as scripts you run by hand.

### How do I migrate an existing Shopware shop to PaaS Native?

There is no single migration command, and the approach is project-specific. In outline:

1. **Prepare the codebase** as described above, and get it building locally.
2. **Create the project and application** and get an empty deployment running, so you know the platform side works before you move any data. See [Quickstart](./get-started/quickstart.md).
3. **Import the database** through the CLI tunnel: `sw-paas open service --service database --port 3306`, then restore your dump against the local port with any MySQL client.
4. **Import media through Shopware** — the Admin media manager for small volumes, or the Shopware API at scale. Object storage cannot be written from outside the container, so there is no `s3 sync` shortcut.
5. **Reindex and verify.** Run `bin/console dal:refresh:index --use-queue`, then check the storefront, the admin, payment and any integration that talks to an external system from the [egress IP addresses](#what-ip-addresses-does-paas-use-for-outbound-traffic).

**Plan the media step first.** It is usually the longest part of a migration and the most frequently underestimated. Run the whole sequence once against a development application and measure how long media import takes before committing to a go-live date.

:::info
This is an outline, not a procedure. A detailed migration guide is in preparation. Until it is published, plan the migration with your implementation partner or your contact at Shopware.
:::

## Services and configuration

### How are secrets managed in PaaS?

Secrets are stored in the PaaS secret store and can be applied at the organization, project, or application level. They are encrypted in the database and decrypted only when accessed via the CLI.

### Are CDN or database configurations customizable?

**CDN:** the Fastly configuration is managed by the platform, and a maintained set of default VCL snippets is deployed automatically. You can add your own VCL snippets from your repository using `services.fastly.snippets_path`, and optionally disable the defaults. See [Fastly Snippets](./cdn/fastly-snippets.md).

**Database:** the MySQL version is configurable in [`application.yaml`](./fundamentals/application-yaml.md). Other database parameters are managed by the platform and cannot be customized.

### Can I purge the CDN cache without deploying new code?

Yes. Create a new deployment from the existing build:

```bash
sw-paas application deploy create
```

A full cache purge runs after every deployment.

### Why does search return no results after I enable OpenSearch?

Indexing is not automatic. After enabling OpenSearch and deploying, you must run the indexing command yourself — the deployment reports success while the index is still empty. See [How to set up OpenSearch](./guides/opensearch.md).

### How often does the scheduler run scheduled tasks?

The platform runs the scheduler every 5 minutes.

### How do I add or change a cron job?

Cron jobs are declared in [`application.yaml`](./fundamentals/application-yaml.md) and then have to be **enabled separately**, so adding one is a three-step sequence: deploy the configuration, enable the job with `sw-paas application cronjob update --enable`, then deploy again.

Use `sw-paas application cronjob list` to see the current state and `cronjob logs` to inspect runs. See [Manage Cron Jobs](./guides/cronjobs.md).

### What is the difference between build and runtime environment variables?

Environment variables carry a scope. `BUILD` variables are available during the build; `RUN` variables are available to the running application. The same name can be defined with both scopes and different values.

The same distinction applies to vault secrets: type `buildenv` for build time, type `env` for runtime. A credential needed to install a private Composer package must be `buildenv` — a runtime secret is not available during the build.

### Can I configure additional queues?

No. Creating additional queues is not currently supported.

### What IP addresses does PaaS use for outbound traffic?

Outbound (egress) traffic from Shopware running in PaaS to the internet currently originates from the same three static IP addresses (AWS `eu-central-1` region):

- `18.156.111.92`
- `52.59.182.116`
- `18.159.165.194`

These addresses are currently stable, so you can safely allowlist them in external systems (for example, to grant PaaS access to an ERP system or other third-party services).

### Can I protect an application with basic auth?

Basic auth is not recommended because it can lead to unexpected behavior in the platform setup. To restrict access temporarily, use Shopware maintenance mode instead.

## Monitoring and performance

### Why don't I see runtime logs in the Shopware Admin?

Runtime logs are not exposed in the Admin. All application logs are available through Grafana Loki — see [Logs](./monitoring/logs.md). Only `stdout` and `stderr` are collected.

### Why does one of my extensions produce no logs?

Only `stdout` and `stderr` are collected. An extension that writes its logs to a file will not appear in Grafana. Such extensions need to be adapted for a containerized environment.

### Are OpenSearch and Grafana protected by SSO?

No. Single sign-on for tools such as Grafana and OpenSearch is not available at this stage.

### Are Blackfire or Tideways supported?

Both are supported as application performance monitoring integrations. Each needs an account of your own — the platform does not provide one.

The setup pattern is the same for both. Store the credentials as `env` secrets in the vault, enable the service in [`application.yaml`](./fundamentals/application-yaml.md), then update your application. The secret must exist **before** you enable the service, otherwise the deployment fails. The probe or extension is added to your image automatically, so do not list it under `app.php.extensions`.

**Blackfire** — store `BLACKFIRE_SERVER_ID` and `BLACKFIRE_SERVER_TOKEN`, then set `services.blackfire.enabled` to `true`. See [Blackfire](./monitoring/blackfire.md).

**Tideways** — store `TIDEWAYS_API_KEY`, then set `services.tideways.enabled` to `true`. Your shop reports under the service name `shopware`. Tideways runs on shop applications only; enabling it on a composable frontend is rejected when the configuration is validated. See [Tideways](./monitoring/tideways.md).

### Can I run more than one profiler at a time?

No. Only one can be active, and a profiler also displaces tracing:

- **Blackfire and Tideways are mutually exclusive.** Setting both to `true` is rejected with the error `blackfire and tideways cannot be enabled at the same time`.
- **A profiler suppresses OpenTelemetry tracing.** While either one is enabled, your application does not send traces, and the Tempo data source in Grafana stays empty for that period.

To return to tracing, set `enabled` back to `false` for whichever profiler is active, then update the application. See [Traces](./monitoring/traces.md).

### Why is a page missing from my profiler?

Pages served from the CDN cache never reach PHP, so neither Blackfire nor Tideways sees them. Request the page in a way that bypasses the cache, or look at a page that is not cacheable.

### Does Shopware run load tests for me?

No. Managed load testing is not part of the platform, and Shopware does not run load tests on your behalf.

**Load testing your own application before going live is strongly recommended**, and it is your responsibility. Your traffic profile, catalogue size and custom code determine how the application behaves under load, and only a test against your own shop will show that.

Run load tests against a non-production application rather than your live shop, and tell us in advance when you plan a test at significant volume so that we are not responding to it as an incident. For traffic peaks you can plan for, such as a campaign or Black Friday, let us know early, so capacity can be reviewed.

## Availability, incidents and maintenance

### Where does Shopware's responsibility end and mine begin?

**Shopware operates the platform.** That covers the Kubernetes infrastructure, the managed services (database, object storage, search, cache), the CDN and WAF, platform patching, backups, and the availability of all of it.

**You operate your application.** That covers your code and extensions, your Shopware configuration, your database migrations, your Shopware version upgrades, and watching your own application's behaviour in Grafana.

The line matters most in three places:

- **Patching.** Shopware patches the platform layer. Keeping Shopware itself up to date is yours.
- **Incidents.** A platform incident is ours to detect and resolve. An application incident is yours, and we can only help diagnose it.
- **Capacity.** The platform scales your application within the limits of your plan. Whether your code performs under that load is something only you can test.

### What availability does the platform target?

Shopware aims to achieve or exceed a **Monthly Uptime Percentage of 99.9%** for the hosting infrastructure in the Production Environment. The binding wording is in the [PaaS Native Supplementary Agreement](https://www.shopware.com/en/legal/paas-native/), Clause 2 — this page is a summary, not the contract.

Three scoping points are worth knowing before you rely on the figure:

- **Production only.** Development, staging and sandbox environments are excluded, as are your own code, your configuration and third-party extensions.
- **The shop, not the tooling.** The target covers the Production Environment serving traffic. The CLI, deployment pipelines, provisioning, logging and monitoring access, backup and restore tools and the database tunnel are explicitly *not* covered by it (Clause 2.3).
- **It starts at go-live.** Uptime measurement and service credits apply from the point you have notified Shopware in writing of your productive go-live (Clause 3.1).

### What happens if the availability target is missed?

Service Credits apply, calculated as a percentage of the Hosting Fees for the affected month. The scale, the claim procedure and the deadlines are set out in [Clause 3 of the Supplementary Agreement](https://www.shopware.com/en/legal/paas-native/) — talk to your contact at Shopware if you think a claim applies.

### What are the recovery objectives (RTO and RPO)?

Shopware targets a recovery time objective and a recovery point objective of **24 hours** for the hosting and platform layer.

These are **operational objectives, not guaranteed recovery times**. Actual recovery duration depends on the nature of the incident and on how much data has to be restored. The technical backup configuration described under [Data, backups and recovery](#data-backups-and-recovery) is designed to meet these objectives. In practice the available recovery point is usually far more recent.

### How and when is the platform patched?

Updating the hosting and platform infrastructure is Shopware's responsibility. Patching is **continuous and risk-based** rather than tied to a fixed cycle: the need for updates is assessed on an ongoing basis against criticality, available patches and impact on security, stability and operation.

Security-relevant assessment is not deferred to a scheduled maintenance date. For vulnerabilities with a CVSS base score above 9.0, analysis and mitigation begin within one working day of confirmed knowledge that the platform layer is affected.

Updating the Shopware software and your own application remains your responsibility.

### How much notice do I get for maintenance?

Routine, required and scheduled maintenance is announced **at least 7 days in advance** at [status.shopware.com](https://status.shopware.com/) or in writing, and is capped at **no more than eight hours per month in total**. Announced maintenance within that cap is excluded from the uptime calculation.

Emergency maintenance — security-critical measures, patches or changes to mitigate acute risks or stabilize operations — may be carried out with shorter notice or none.

Subscribe on the status page so the announcements reach you.

### How will I know about a platform incident?

[status.shopware.com](https://status.shopware.com/) is the official channel for operational communication. Four services are tracked separately — SaaS Infrastructure, SaaS Application, PaaS Native Infrastructure and PaaS Native Application — and you can subscribe to updates there.

Proactive individual notification within a fixed time window is not part of the service. Response times for incidents you report through the ticket system are defined by your support plan.

### How do I report an incident?

Open a support ticket at [support.shopware.com](https://support.shopware.com), or through the ticket system in your Shopware Account. Each incident is assessed to determine whether the cause is infrastructure, your application, or a third-party service, then routed accordingly.

If you are a partner raising a ticket on behalf of a customer, the form asks for **your customer's customer number** — that is what identifies the right support entitlement for the shop in question. Agencies and customers can coordinate a request together.

Infrastructure change requests go through the same ticket process.

### When should I use Slack and when should I open a ticket?

**Slack is for speed. Tickets are the record.**

Use **Slack**, where a channel exists, for quick questions and coordination. It is best-effort during business hours.

Open a **ticket** whenever something is broken, needs investigation, or may need escalating later. Anything with a commercial project behind it belongs in a ticket, even if the conversation started in Slack. Only tickets are handled under the support terms in your agreement.

Include the trace ID if you have one — it is the fastest route to the cause.

### Is the problem in my application or on the platform?

As a rule of thumb, **HTTP 500 errors** almost always originate in application code or extensions, while **502, 503 and 504 errors** are more likely to be infrastructure-related. The logs in Grafana usually confirm which it is. If in doubt, raise a ticket and we will classify it.

### How does the platform scale when my application gets busy?

Horizontally and automatically, within the capacity configured for your plan. Automatic scaling applies to production applications.

What your plan currently accounts for is **resource consumption** — compute, memory and database capacity — rather than requests or bandwidth. A busy shop is only a problem when it needs more of those than your plan provides. Beyond that point requests can become slow or fail. Data already stored is not affected.

For peaks you can plan for, such as a campaign or Black Friday, tell us in advance, so the capacity requirement can be reviewed and, where technically possible, prepared.

### What counts as resource overage?

Sustained consumption above your plan, not busy days.

The measured resources are compute in vCPU, memory in GB RAM, and database capacity in ACU — each assessed separately, for production only. Assessment is based on the **average over a three-month evaluation period**, so short-term load peaks, seasonal peaks and campaigns do not in themselves trigger overage; they matter only in so far as they move that average.

Your own resource base is the one agreed in your contract — that is where to check what you are entitled to, not a public plan page. If you are consistently above it rather than spiking, that is a sizing conversation; talk to your contact at Shopware. [Clause 5 of the Supplementary Agreement](https://www.shopware.com/en/legal/paas-native/) sets out how overage is determined and billed.

## Data protection and security

### Where is my data stored?

In AWS `eu-central-1` (Frankfurt, Germany). Content delivery is provided through Fastly's global network.

### Is there a web application firewall?

Yes. Every application is protected by the Fastly Next-Gen WAF using the `Core` feature set, which covers the OWASP Top 10 categories. It is enabled and configured automatically and requires no action. See [Security Features](./cdn/security-features.md).

### Is my data encrypted?

The managed MySQL cluster encrypts data **at rest and in transit** automatically. Traffic to your shop is served over TLS terminated at the CDN.

### Which third parties process data on the platform?

The platform runs on **AWS** and uses **Fastly** for content delivery and the web application firewall. Optional integrations such as Blackfire are only active if you enable them.

The authoritative and complete list of subprocessors is maintained in your data processing agreement. Please refer to that rather than to this page.

### How will I be informed about a personal data breach?

Notification obligations for personal data breaches follow the GDPR and the terms of your data processing agreement, including the statutory deadlines. This is separate from the operational incident communication described under [Availability, incidents and maintenance](#availability-incidents-and-maintenance).

### How does Shopware handle a security incident?

Every incident is also assessed for security relevance. Where exposure of customer data, loss of data integrity or unauthorized access cannot be ruled out, the incident is handled as a security incident: Shopware's Information Security Officer is involved immediately, the Data Protection Officer where applicable, and evidence is preserved before remediation.

Security incidents are treated at the highest severity level and follow Shopware's information security management process. Root cause analysis and a documented review after the event are mandatory at that level.

### Is the platform covered by security certifications?

Shopware holds an **ISO 27001** certification and a **SOC 2 Type I** report, and the platform runs on AWS and Fastly, which carry their own certifications for the infrastructure layer.

If you are completing a security review, ask for the **scope statement** rather than just the certificate — that is what tells you which operations and services are covered. Certificates, scope statements and current reports are available through the [Shopware Trust Center](https://www.shopware.com/en/shopware-trust-center/) or your contact at Shopware.

### Can I run my own penetration test or vulnerability scan?

Penetration tests against your own publicly reachable application are possible **after prior coordination with Shopware**. Scope, timing, source addresses and test methods must be agreed in advance.

Continuous automated vulnerability scanning is permitted only against publicly reachable endpoints of your own application, and only where it does not affect the security, stability or availability of the platform. Installing your own agents or gaining direct access to the infrastructure is not possible.

## Working with the CLI

### Can I connect to my PaaS instance via SSH?

Yes, you can connect to your PaaS instance — but not via traditional SSH. Instead, we provide a remote terminal session through the `sw-paas exec` CLI command. This command allows you to execute shell commands inside your PaaS environment remotely, effectively giving you SSH-like access for troubleshooting, deployments, or interactive sessions.

### What is the difference between `exec` and `command`?

1. **Container Management**:

   - `exec`: Uses an existing container and provides an interactive shell
   - `command`: Spins up a new container specifically for the command execution

2. **Execution Mode**:

   - `exec`: Interactive and synchronous
   - `command`: Non-interactive and can be asynchronous

3. **Use Cases**:
   - `exec`: Best for debugging, maintenance, and interactive work
   - `command`: Best for automation, CI/CD, and scheduled tasks

### Why do `exec` and `command` fail after a failed deployment?

This is intentional. If the last deployment failed, the platform cannot reliably determine which container image to use, so it does not start a session.

### Is Windows supported for CLI usage?

Windows is supported on a best-effort basis. Linux and macOS are recommended. The `exec` and `open service` commands establish mTLS tunnels that are not compatible with NAT, which causes recurring problems on Windows and WSL. If you use WSL, set the network mode to `Host` or `Mirrored` — see [Known issues](./known-issues.md).
