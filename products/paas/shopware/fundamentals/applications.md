---
nav:
  title: Applications
  position: 40
---

# Applications

Shopware PaaS Native supports multiple applications within a project, such as environments for production, staging, or temporary feature testing.

Each application has its own compute resources, infrastructure, and deployment configuration, so you can tailor each environment to its specific needs.

For instance, you might allocate smaller, hibernating compute instances for staging, while reserving larger, always-on resources for production.

## Creating an Application

Create a new application to a project:

```sh
sw-paas application create
```

## Build your application

To trigger a new build for the application via CLI, use the following command:

```sh
sw-paas application build start
```

This command initiates the build process, packaging your application and preparing it for deployment. While the build is running, you can monitor its progress and view real-time output by following the logs:

```sh
sw-paas application build logs
```

## Update your application

To update your application, you need to run the following command, and provide the commit SHA:

```sh
sw-paas application update
```

This command initiates the build process, packaging your application and preparing it for deployment.
Then you need to deploy it, see below.

## Deploy your application

To deploy your application and make your changes live, you need to run the following command:

```sh
sw-paas application deploy
```

It will let you chose, which build you want to deploy.
This is very handy, since you chose any successful build to deploy. The lastest one to bring your change live, or previous one to fix an issue that arise.

## Deployments management

To list all past deployments:

```sh
sw-paas application list-deployments
```

To get details about a given deployment:

```sh
sw-paas application get-deployment
```

## Plugin Management

Plugin management is done [via Composer](../../../../guides/hosting/installation-updates/extension-managment#installing-extensions-with-composer) because the platform runs in a high-availability and clustered environment.

In such setups, local changes aren't feasible, as all instances must remain identical and stateless. This ensures consistency across all deployments.

### Using Privately Hosted Packages

To pull privately hosted Composer packages, you need to provide authentication credentials. Create a `COMPOSER_AUTH` secret using the CLI:

```sh
sw-paas vault create
```

Follow the prompts to enter your Composer authentication JSON as a `buildenv`. This secret will be used during builds to access private repositories.

## Executing Commands

Shopware PaaS Native provides two primary ways to run commands in your application environments via CLI: `exec` and `command`.

### `exec` Command

The `exec` command allows you to execute commands in a remote terminal session for your applications. This is useful for running commands directly on your application's environment, such as debugging, maintenance, or running one-off commands interactively.

```sh
sw-paas exec --new
```

This opens an interactive shell session inside your application's container.

### `command` Command

The `command` command lets you create and manage commands that are executed in dedicated containers. This is particularly useful for CI/CD environments, asynchronous command execution, automated processes, or situations where you don't need to wait for command completion.

Unlike `exec`, which provides an interactive shell, `command` runs your specified command in a new, isolated container and does not require you to wait for its completion.

The default execution directory is `/var/www/html` and the container has a time-to-live (TTL) of 1 hour, so your command must complete within that timeframe.

```sh
sw-paas command create
```

For a complete list of available commands, refer to the [Shopware console commands documentation](https://docs.shopware.com/en/shopware-6-en/tutorials-and-faq/shopware-cli).

## Domain Management

### Shopware Domain

When you deploy an application for the first time, it automatically receives a complimentary `shopware.shop` domain. This allows you to access and test your application right away, even before setting up a custom domain.

The assigned domain is generated based on your application's name and unique identifier.

### Custom Domain

You can configure custom domains for your applications using the `sw-paas` CLI domain command. This allows you to attach multiple domains to a single application and route traffic through the Fastly CDN for optimal performance.

#### Creating Custom Domains

To create a custom domain for your application:

```sh
sw-paas domain create
```

Follow the prompts to specify your domain name and application. You can attach multiple domains to a single application.

#### DNS Configuration

After creating a custom domain, you must configure your DNS settings to point to the PaaS CDN endpoint:

**Configure your custom domain's DNS to point to:**

```dns
cdn.shopware.shop
```

This configuration ensures that all traffic to your custom domain is routed through the Fastly CDN for optimal performance and caching.

#### Application Deployment

Following domain creation, you must redeploy your application. You can do it by using:

```sh
sw-paas application deploy
```

This process will be automated in future releases.

#### Shopware Configuration

Subsequently, you can configure the domain within Shopware and associate it with a storefront. Status update functionality is currently under development and should be considered a beta feature.

For more detailed information about CDN configuration and best practices, refer to the [CDN documentation](../cdn/index.md).
