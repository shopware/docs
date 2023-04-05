# Platform.sh Deployment

## Overview

[Platform.sh](https://platform.sh) is a powerful hosting provider for your infrastructure that's quite easy to use.

Keep in mind, though, that this is **not** the only way to go for apps. You can, of course, use different services, providers or host everything on a dedicated machine. This guide explains to you how to get started for hosting an app on Platform.sh.

Read more about why this kind of hosting could be useful [here](README.md) or in there [official documentation](https://docs.platform.sh/).

## Getting started

To deploy your app on [Platform.sh](https://platform.sh), just follow those instructions:

* [Source Integrations](https://docs.platform.sh/integrations/source.html)
* [Private Git repository](https://docs.platform.sh/development/private-repository.html)
* [Using the Platform.sh CLI](https://docs.platform.sh/development/cli.html)

## Most important steps

1. Configure your [Source Integrations](https://docs.platform.sh/integrations/source.html) (Optional, but highly recommended!)
1. Install the [Platform.sh CLI](https://docs.platform.sh/development/cli.html)
1. [Authenticate](https://docs.platform.sh/development/cli.html#authentication) using your Platform.sh account
1. Create required config files. Also, if you create a new project, Platform.sh shows you a checklist where you can generate the code for these files
    * [routes.yaml](https://docs.platform.sh/configuration/routes.html)
    * [services.yaml](https://docs.platform.sh/configuration/services.html)
    * [.platform.app.yaml](https://docs.platform.sh/configuration/app.html)
1. Push your changes to your Git Repo
1. After it's been deployed, migrate the database by connecting via [SSH to your project](#ssh-into-your-project) and running the command `vendor/bin/doctrine-migrations migrations:migrate`
1. That's it!

Your project should now be running at [https://console.platform.sh](https://console.platform.sh), and you can start developing your own app!

## Good to know

### Automatic TLS certificates based on Branch / Pull Request

[Platform.sh](https://platform.sh) automatically creates a URL and TLS certificate using [Let's Encrypt](https://letsencrypt.org/) based on your [routes.yaml](https://docs.platform.sh/configuration/routes.html) file for every active environment.

You should be aware that the URL will be built in a specific way. If your branch name gets too long, [Let's Encrypt](https://letsencrypt.org/) won't be able to generate a certificate.

To avoid this, you should configure your [Source Integrations](https://docs.platform.sh/integrations/source.html) to use the name of your **Pull Request** instead of the **Branch Name**.

**Read more about this topic from  [doc.platform.sh](https://docs.platform.sh/configuration/routes/https.html#lets-encrypt-limits-errors-and-branch-names).**

### Hook commands

You can place commands like the database migration mentioned above inside your `.platform.app.yaml` under [hooks](https://docs.platform.sh/configuration/app/build.html#hooks).
This way your commands will be executed every time it deploys a new build _(e.g. if your branch gets updated)_.

Your file could than look like this _(with the default [AppTemplate](https://github.com/shopware/AppTemplate))_:

```yaml
// .platform.app.yaml
hooks:
    build: |
        set -e
        php bin/console assets:install --no-debug
    deploy: |
        set -e
        php bin/console cache:clear
        php bin/console doctrine:migrations:migrate --no-interaction
```

By default, PHP images already run a `composer install` command, so we don't need that in our hooks.
Learn more about that [here](https://docs.platform.sh/languages/php.html#build-flavor).

## Useful Platform.sh commands

In order to use the following commands you need to have the [Platform.sh CLI](https://docs.platform.sh/development/cli.html) installed.

### List all Platform.sh CLI commands

```bash
platform list
```

### Set Platform.sh as new remote host

This step is needed if you want to get more information about the project using the [Platform.sh CLI](https://docs.platform.sh/development/cli.html).

Refer to this documentation on [Create environment](https://docs.platform.sh/gettingstarted/introduction/own-code/create-project.html)

```bash
platform project:set-remote <Project ID>
```

### Push single branch to Platform.sh and activate it

Refer to this documentation on [Create environment](https://docs.platform.sh/gettingstarted/developing/dev-environments/create-environment.html)

```bash
# Push to Platform.sh
git push -u platform <Branch Name>

# Activate branch
platform environment:activate <Branch Name>
```

### Get available URLs for the current project

Refer to this [Documentation](https://docs.platform.sh/development/access-site.html#visiting-the-site-on-the-web)

```bash
platform url 
```

### SSH into your project

Refer to this documentation on [SSH](https://docs.platform.sh/development/ssh.html)

```bash
platform ssh
```

### Connect to the database using SSH tunneling

Refer to this documentation on [SSH Tunneling](https://docs.platform.sh/development/local/tethered.html#ssh-tunneling)

```bash
# List all possible commands
platform tunnel:list

# Open tunnel for all services
platform tunnel:open

# Connect to the remote database normally, as if it were local.
mysql --host=127.0.0.1 --port=30001 --user='user' --password='' --database='main'
```

### Accessing log files

Refer to this documentation on [logs](https://docs.platform.sh/development/logs.html)

```bash
platform log --help
```
