---
nav:
  title: Deployment Helper
  position: 15

---

# Deployment Helper

::: warning
The Deployment Helper is experimental and configuration may change in the future. Please use it with caution.
:::

The Deployment Helper is a tool that unifies the steps executed after the Code has been uploaded to the server.
On a traditional deployment, you would run it after the files have been uploaded. 
When using a Containerized environment you would run Deployment Helper with the new source code and then switch over the traffic.

## Installing the Deployment Helper

The Deployment Helper is a composer package and can be installed via composer:

```bash
composer require shopware/deployment-helper
```

Then the helper can be executed via:

```bash
vendor/bin/shopware-deployment-helper run
```

## What does the Deployment Helper exactly do?

The Deployment Helper checks for you, if Shopware is installed and if not, it will install it for you.
It will also check if the database server is accessible, and if not, it will wait until it is.

Besides installing or updating Shopware, it also simplifies common tasks which normally are executed during the deployment like:

- Installing or updating the extensions (apps and plugins)
- Compiling the theme
- Run custom commands
- Run one time commands

## Configuration

The Deployment Helper can be configured via a `.shopware-project.yml` file in the root of your project.
The following configuration options are available:

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
  extension-management:
    enabled: true

    # These extensions are not managed, you should use one-time-tasks to manage them
    exclude:
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
- `SALES_CHANNEL_URL` - The URL of the Storefront sales channel (default: `http://localhost`)

## One Time Tasks

One time tasks are tasks that should be executed only once during the deployment, like a migration script.

You can check with `./vendor/bin/shopware-deployment-helper one-time-task:list` which tasks were executed and when.
To remove a task, use `./vendor/bin/shopware-deployment-helper one-time-task:unmark <id>`. This will cause the task to be executed again during the next update.
To manually mark a task as run you can use `./vendor/bin/shopware-deployment-helper one-time-task:mark <id>`.


## Usage examples

### Container

In a Docker environment, you have a base image with a running PHP Webserver.
From that image you make a new image with your Shopware source code.
To prepare the Shopware source code, you can run [shopware-cli project ci](https://sw-cli.fos.gg) to install the dependencies and build the assets.
On deployment you spawn a second container or init a container, which runs the Deployment Helper.
The Deployment Helper sets up Shopware when it is not installed, installs the extensions and runs the one-time tasks.


### SFTP / Deployer

When using SFTP or Deployer, you clone the repository to the CI/CD server, run the [shopware-cli project ci](https://sw-cli.fos.gg) command to install the dependencies and build the assets.
Then you upload the source code to the server and run the Deployment Helper on the server.
The Deployment Helper sets up Shopware when it is not installed, installs the extensions and runs the one-time tasks.
