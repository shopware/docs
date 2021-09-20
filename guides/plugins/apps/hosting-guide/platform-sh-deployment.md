# Platform.sh Deployment

## Overview

[Platform.sh](https://platform.sh) is a powerful hosting provider for your infrastructure.
Read more about why this kind of hosting could be useful [here](README.md) or on there [official documentation](https://docs.platform.sh/).

## Getting started
To deploy your app on [Platform.sh](https://platform.sh), just follow the instructions:

* [Source Integrations](https://docs.platform.sh/integrations/source.html)
* [Private Git repository](https://docs.platform.sh/development/private-repository.html)
* [Using the Platform.sh CLI](https://docs.platform.sh/development/cli.html)

## Most important steps

1. Install the [Platform.sh CLI](https://docs.platform.sh/development/cli.html)
2. [Authenticate](https://docs.platform.sh/development/cli.html#authentication) using your Platform.sh account
3. Create required config files. Also, if you create a new project, Platform.sh shows you a checklist where you can generate the code for these files.
    * [routes.yaml](https://docs.platform.sh/configuration/routes.html)
    * [services.yaml](https://docs.platform.sh/configuration/services.html)
    * [.platform.app.yaml](https://docs.platform.sh/configuration/app.html)

After the deployment has been finished you can use the [Platform.sh CLI](https://docs.platform.sh/development/cli.html) to set up the database.
First [ssh to your server](#ssh-into-your-project) and then run the migrations: `vendor/bin/doctrine-migrations migrations:migrate`.

That's it! Your server is running, and you can start developing your own app.

## Good to know

### Automatic TLS certificates based on Branch / Pull Request
[Platform.sh](https://platform.sh) automatically creates a URL and TLS certificate using [Let's Encrypt](https://letsencrypt.org/) based on your [routes.yaml](https://docs.platform.sh/configuration/routes.html) file for every active environment.

You should be aware though that the URL will be build in a specific way. If your branch name gets to long, [Let's Encrypt](https://letsencrypt.org/) won't be able to generate a certificate.

To avoid this you should configure your [Source Integrations](https://docs.platform.sh/integrations/source.html) to use the name of your **Pull Request** instead of the **Branch Name**.

**Documentation**: https://docs.platform.sh/configuration/routes/https.html#lets-encrypt-limits-errors-and-branch-names.

### Hook commands
You can place commands like the database migration mentioned above inside your `.platform.app.yaml` under [hooks](https://docs.platform.sh/configuration/app/build.html#hooks).
This way your commands will be executed every time it creates a new build.

{% code title=".platform.app.yaml" %}
```yaml
hooks:
    build: |
        set -e
        php vendor/bin/doctrine-migrations migrations:migrate --no-interaction
    deploy: |
        set -e
        php vendor/bin/doctrine-migrations migrations:migrate --no-interaction
```
{% endcode %}

## Useful Platform.sh commands

### Set Platform.sh as new remote host
This step is needed if you want to get more information about the project using the [Platform.sh CLI](https://docs.platform.sh/development/cli.html).

**Documentation:** https://docs.platform.sh/gettingstarted/introduction/own-code/create-project.html
```bash
platform project:set-remote <Project ID>
```

### Push single branch to Platform.sh and activate it
**Documentation:** https://docs.platform.sh/gettingstarted/developing/dev-environments/create-environment.html
```bash
# Push to Platform.sh
git push -u platform <Branch Name>

# Activate branch
platform environment:activate <Branch Name>
```

### Get available URLs for the current project
**Documentation:** https://docs.platform.sh/development/access-site.html#visiting-the-site-on-the-web
```bash
platform url 
```

### SSH into your project
**Documentation:** https://docs.platform.sh/development/ssh.html
```bash
platform ssh
```

### Accessing log files
**Documentation:** https://docs.platform.sh/development/logs.html
```bash
platform log --help
```