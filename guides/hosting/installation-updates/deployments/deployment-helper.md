---
nav:
  title: Deployment Helper
  position: 15

---

# Deployment Helper

::: warning
The Deployment Helper is experimental and configuration may change in the future. Please use it with caution.
:::

The Deployment Helper is a tool that unifies the steps executed after the Code has been uploaded to the server. On a traditional deployment, you would run it after the files have been uploaded, or when using a Containerized environment, and you would run deployment helper with the new source code and then switch over the traffic.

## Installing the Deployment Helper

The Deployment Helper is a composer package and can be installed via composer:

```bash
composer require shopware/deployment-helper
```

and the helper can be executed via:

```bash
vendor/bin/shopware-deployment-helper run
```

## What does the Deployment Helper exactly do?

The deployment helper checks for you if Shopware is installed and if not, it will install it for you. It will also check if the database server is accessible, and if not, it will wait until it is.

Besides installing Shopware or updating Shopware, it also simplifies usual tasks which normally are executed during the deployment like:

- Installing or updating the extensions (app and plugins)
- Compiling the theme
- Run custom commands
- Run one time commands

## Configuration

The Deployment Helper can be configured via a `.shopware-project.yml` file in the root of your project. The following configuration options are available:

```yaml
deployment:
  hooks:
    pre: |
      echo "Before deployment general"
    post: |
      echo "After deployment general"
    pre-install: |
      echo "Before running system:install"
    post-install: |
      echo "After running system:install"
    pre-update: |
      echo "Before running system:update"
    post-update: |
      echo "After running system:update"

  # Automatically installs and updates all extensions included in custom/plugins and custom/apps and composer
  extension-managment:
    enabled: true

    # These extensions are not managed, you should use one-time-tasks to manage them
    exclude_extensions:
      - Name
  one-time-tasks:
    - id: foo
      script: |
        # runs one time in deployment, then never again
        ./bin/console --version
```

Additionally, you can configure the Shopware installation using the following environment variables:

- `INSTALL_LOCALE` - The locale to install Shopware with (default: `en-GB`)
- `INSTALL_CURRENCY` - The currency to install Shopware with (default: `EUR`)
- `INSTALL_ADMIN_USERNAME` - The username of the admin user (default: `admin`)
- `INSTALL_ADMIN_PASSWORD` - The password of the admin user (default: `shopware`)
- `APP_URL` - The URL of the Shopware installation (default: `http://localhost`)

The `APP_URL` will also be used for the sales channel configuration.

## One Time Tasks

One Time Tasks are tasks that are executed only once during the deployment. This can be useful for tasks that should only be executed once, like running a migration script.

You can check with `./vendor/bin/shopware-deployment-helper  one-time-task:list` which tasks are executed and when. To manually remove a task, use `./vendor/bin/shopware-deployment-helper one-time-task:unmark <id>`.
and to re-mark a task you can use `./vendor/bin/shopware-deployment-helper one-time-task:mark <id>`.


## Real World usage example

### Container

In a Docker environment, you would have a base image with a running PHP Webserver and from that image you would make a new image with your Shopware source code. To prepare the Shopware source code, you can run [shopware-cli project ci](https://sw-cli.fos.gg) to install the dependencies and build the assets. And on deployment you would spawn a second container or init container, which runs the deployment helper. The deployment helper would se t up Shopware when not, install the extensions, and run the one-time tasks.


### SFTP / Deployer

When using SFTP or Deployer, you would clone the repository to the CI/CD server, run the [shopware-cli project ci](https://sw-cli.fos.gg) command to install the dependencies and build the assets. Then you would upload the source code to the server and run the deployment helper on the server. The deployment helper would set up Shopware when not, install the extensions, and run the one-time tasks.
