# Setup Template

The setup template is a derivation from the [shopware/production](https://github.com/shopware/production) template. It contains build and deployment logic for Shopware PaaS as well as configuration for the underlying infrastructure and services. In this chapter we will have a look at these customizations.

Below is a directory overview of the PaaS setup template.

```text
shopware/paas/
├─ .platform/
│  ├─ applications.yaml
│  ├─ routes.yaml
│  ├─ services.yaml
├─ bin/
├─ config/
├─ custom/
├─ files/
│  ├─ theme-config/
├─ src/
├─ .platform.app.yaml
```

## [applications.yaml](https://github.com/shopware/recipes/blob/main/shopware/paas-meta/6.4/.platform/applications.yaml)

This file contains Shopware PaaS specific configuration and can be customized as needed for your individual project.

### name

Is the name of your app. It's used in commands like

```bash
shopware ssh -A app 'bin/console theme:dump'
```

Unless there's specific need for it, leave it as `app`.

### type

The base image used for your build process.

### variables

This section contains configuration for environment variables or server settings. General store settings and configuration are set here. In this place you can inject custom environment variables or enable feature flags.

Variables in the `env` section are automatically injected as environment variables.

### hooks

Lifecycle hooks are custom scripts that are called during your build and deploy processes. See more on the [deployment process](./build-deploy#push-main-branch).

#### build hook

This script is called during the build process and builds your applications assets and disables the UI installer. You can customize this script if you need. During the execution, you may perform write operations on the file system, which are prohibited in the proceeding steps - unless the corresponding directory is [mounted](#mounts).

You do not have access to any of the services configured, as the application is not running yet. You should ensure, to perform as much of your entire building procedure during the build step, as web traffic is blocked during the execution of the deploy step.

#### deploy hook

{% hint style="warning" %}
The environment will be cut off from web traffic during the execution of the deploy hook. The shorter this script is, the shorter the downtime will be.
{% endhint %}

This script is called during the deployment process. Theme configuration is copied, the install scripts are executed and secrets are generated

* Copy theme configuration
* Run database migrations
* Clear cache

If this is the first deployment, the following operations are performed

* Setup script is executed
* Theme is set
* Secrets are generated
* `installer/installed` file is created

You can also customize this script, however make sure to keep operations to a minimum, as your store will not be exposed to web traffic during the execution. Connections made during the meantime will be queued in a suspended state and not necessarily fail, but take longer than usual (i.e. until the deployment has finished).

#### post_deploy

Analogous to the two preceeding hooks, the post_deploy hook provides an entry point for custom scripts. However, this hook is executed after the application container is accepting connections.

### relationships

This section defines the mapping between services created in the [services.yaml](#platform-services-yaml) and the application itself.

### mounts

By default, the entire storage of your application is read-only. All directories listed here are exempt from this policy.

### web

The public root of your application `public/index.php` is configured, so the server knows where to route dynamic requests.

### workers

Workers are copies of your application instance after the [build hook](#build-hook) has been executed. The are usually configured with a start command. By default there are two configured workers - one for message queues and one for scheduled tasks.

## [.platform / routes.yaml](https://github.com/shopware/recipes/blob/main/shopware/paas-meta/6.4/root/.platform/routes.yaml)

This file configures, that incoming http requests are routed to the `app` instance.

## [.platform / services.yaml](https://github.com/shopware/recipes/blob/main/shopware/paas-meta/6.4/root/.platform/services.yaml)

This file contains services which are used by the `app` instances. Depending on your setup, uncomment or add services that you need and they will be created and scaled automatically.

## [files / theme-config](https://github.com/shopware/recipes/tree/main/shopware/paas-meta/6.4/root/files/theme-config)

We suggest checking in your theme configuration to version control in this directory. Read more on the concept of [builds without database](../../guides/hosting/installation-updates/deployments/build-w-o-db.md) as described in [Theme Build](./theme-build.md).
