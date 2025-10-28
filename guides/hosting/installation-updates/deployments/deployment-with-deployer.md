---
nav:
  title: Deployment with Deployer
  position: 10

---

# Deployment with Deployer

## Overview

Automated deployments shouldn't be a pain and have several advantages, like lower failure rates and reproducible builds. Also, they increase overall productivity because actual testing can get more attention.

This article explains the fundamental steps to deploy Shopware 6 to a certain infrastructure, focussing on continuous deployment using [GitLab CI](https://docs.gitlab.com/ee/ci/) or [GitHub Actions](https://github.com/features/actions) and [Deployer](https://deployer.org/) (a deployment tool written in PHP).

## Video

<YoutubeRef video="Oo-KvyxJvpo" title="Continuous Deployment: Automizing Shopware 6 deployments (Developer Tutorial) - YouTube" target="_blank" />

## Prerequisites

Please make sure you already have a working Shopware 6 instance running and that your repository is based on the [Symfony Flex template](../../../installation/template) because this article relies on some scripts to exist in your repository.

### Preparations before the first deployment

[Deployer](https://deployer.org/) has a default directory structure in which it organizes releases, shared files across releases \(e.g., certificates, configuration, or media files\) and the symlink to the current release.

The structure looks like this:

```text
├── .dep
├── current -> releases/1
├── releases
│   └── 1
└── shared
    ├── .env
    └── config
    └── ...
```

Suppose you haven't used such a structure yet, it is recommended to move the current document root contents to a different location because you will have to copy some existing files into the `shared` folder after your first deployment with [Deployer](https://deployer.org/).

For more information, refer to [Migrating existing instance to Deployer structure](deployment-with-deployer#migrating-existing-instance-to-deployer-structure).

### Webserver configuration

Ensure to set the document root of the domain to `/var/www/shopware/current/public`, assuming `/var/www/shopware` is the path you are uploading Shopware to, but this can, of course, differ. The most important part of this path is `current`, which is the symlink to the currently active release.

Because `current` is a symlink, please also make sure your web server is configured to resolve/follow symlinks correctly.

### Require Deployer and deployment-helper

Your project needs to have the following dependencies installed:

```bash
composer require deployer/deployer shopware/deployment-helper
```

## GitLab runner requirements

[GitLab pipelines](https://docs.gitlab.com/ee/ci/pipelines/) are processed by [runners](https://docs.gitlab.com/runner/). Once a pipeline job is created, GitLab notifies a registered runner, and the job will then be processed by that runner.

The [GitLab runner](https://docs.gitlab.com/runner/) must have the following packages installed:

* PHP \(see supported versions in the [System Requirements](https://docs.shopware.com/en/shopware-6-en/first-steps/system-requirements#environment)\)
* [NodeJS](https://nodejs.org/en/)
* [Node Package Manager \(npm\)](https://www.npmjs.com/)
* OpenSSH

This example uses the docker image `ghcr.io/shopware/shopware-cli:latest-php-8.3`. This image meets all requirements.

## Deployment steps

### 1. Cloning the repository

The very first step in the pipeline is cloning the repository into the runner's workspace. GitLab does that automatically for every started job.

### 2. Building the project

All the dependencies of your project must be installed. Shopware 6 uses [Composer](https://getcomposer.org/) for managing PHP dependencies and [Node Package Manager \(NPM\)](https://www.npmjs.com/) for frontend related dependencies.

We use Shopware CLI, which simplifies the installation of the dependencies and building the project assets to build a production-ready version of Shopware.

### 3. Transferring the workspace

For transferring the files to the target server, please configure at least one host in the [`deploy.php`](deployment-with-deployer#deploy-php):

```php
host('SSH-HOSTNAME')
    ->setLabels([
        'type' => 'web',
        'env'  => 'prod',
    ])
    ->setRemoteUser('www-data')
    ->set('deploy_path', '/var/www/shopware') // This is the path, where deployer will create its directory structure
    ->set('http_user', 'www-data') // Not needed, if the `user` is the same user, the webserver is running with 
    ->set('writable_mode', 'chmod');
```

This step is defined in the `deploy:update_code` job in the [`deploy.php`](deployment-with-deployer#deploy-php):

```php
task('deploy:update_code')->setCallback(static function () {
    upload('.', '{{release_path}}', [
        'options' => [
            '--exclude=.git',
            '--exclude=deploy.php',
            '--exclude=node_modules',
        ],
    ]);
});
```

### 4. Applying migrations / install or update plugins

The migrations need to be applied on the target server.

::: danger
If you are deploying to a cluster with multiple web servers, please make sure to run the migrations only on one of the servers.
:::

This step is defined in the `sw:deployment:helper` job in the [`deploy.php`](deployment-with-deployer#deploy-php), which is part of the `sw:deploy` task group:

```php
task('sw:deployment:helper', static function() {
    run('cd {{release_path}} && vendor/bin/shopware-deployment-helper run');
});
```

### 5. Creating the `install.lock` file

Before putting the new version live, ensure to create an empty file `install.lock` in the root of the build workspace. Otherwise, Shopware will redirect every request to the Shopware installer because it assumes that Shopware isn't installed yet.

This task is defined in the `sw:touch_install_lock` job in the [`deploy.php`](deployment-with-deployer#deploy-php), which is part of the `sw:deploy` task group:

```php
task('sw:touch_install_lock', static function () {
    run('cd {{release_path}} && touch install.lock');
});
```

### 6. Running System Checks (Optional)

Before putting the new version live, it is recommended to run the system checks to ensure that the new version is working correctly.

```php
task('sw:health_checks', static function () {
    run('cd {{release_path}} && bin/console system:check --context=pre_rollout');
});
```

> Before incorporating this step into your deployment process, make sure that you are well familiar with the [System Checks Concepts](../../../../concepts/framework/system-check.md) and how to use and interpret the results [Custom usage](../../../../guides/plugins/plugins/framework/system-check/index.md), and the command [error codes](../../../../guides/plugins/plugins/framework/system-check/index.md#triggering-system-checks).

### 7. Switching the document root

After all the steps are done, Deployer will switch the symlinks destination to the new release.

This task is defined in the `deploy:symlink` default job in the [`deploy.php`](deployment-with-deployer#deploy-php).

## Deployer output

This is the output of `dep deploy env=prod`:

```text
$ dep deploy env=prod               

✔ Executing task deploy:prepare
✔ Executing task deploy:lock
✔ Executing task deploy:release
✔ Executing task deploy:update_code
✔ Executing task deploy:shared
✔ Executing task sw:touch_install_lock
✔ Executing task sw:deployment:helper
✔ Executing task deploy:writable
✔ Executing task deploy:clear_paths
✔ Executing task deploy:symlink
✔ Executing task deploy:unlock
✔ Executing task cleanup
Successfully deployed!
```

## Migrating existing instance to Deployer structure

After the very first deployment with Deployer, you have to copy some files and directories from your existing Shopware instance into the directory structure, that was created by Deployer.

Let's agree on the following two paths for the examples:

1. You have copied your existing Shopware instance to `/var/www/shopware_backup`.
2. You have set the `deploy_path` in the [`deploy.php`](deployment-with-deployer#deploy-php) to `/var/www/shopware`.

Now, look at the `shared_files` and `shared_dirs` configurations in the [`deploy.php`](deployment-with-deployer#deploy-php). Simply copy all the paths into `/var/www/shopware/shared`. For the configuration of the `deploy.php` the commands would be the following:

```bash
cp /var/www/shopware_backup/.env.local /var/www/shopware/shared/.env.local
cp -R /var/www/shopware_backup/custom/plugins /var/www/shopware/shared/custom
cp -R /var/www/shopware_backup/config/jwt /var/www/shopware/shared/config
cp -R /var/www/shopware_backup/config/packages /var/www/shopware/shared/config
cp -R /var/www/shopware_backup/files /var/www/shopware/shared
cp -R /var/www/shopware_backup/var/log /var/www/shopware/shared/var
cp -R /var/www/shopware_backup/public/media /var/www/shopware/shared/public
cp -R /var/www/shopware_backup/public/thumbnail /var/www/shopware/shared/public
cp -R /var/www/shopware_backup/public/sitemap /var/www/shopware/shared/public
```

## Generating a new SSH key

To deploy your code to a server, you need to have an SSH key. If you don't have one yet, you can generate one with the following command:

```bash
ssh-keygen -t ed25519
```

It will be used in the above-mentioned GitLab CI/CD pipeline or GitHub Actions.

## Sources

Have a look at the following files. All steps are provided with helpful comments.

### .gitlab-ci.yml

```yaml
# This file defines the GitLab CI/CD pipeline.
# For more information, please visit the GitLab CI/CD docs: https://docs.gitlab.com/ee/ci/README.html
variables:
    GIT_STRATEGY: clone

# This variable holds all commands that are needed to be able to connect to the target server via SSH.
# For this you need to define two variables in the GitLab CI/CD variables:
#   - SSH_PRIVATE_KEY: The contents of the SSH private key file. The public key must be authorized on the target server.
#   - DEPLOYMENT_SERVER: Just the hostname of the target server (e.g. shopware.com, don't include schema or paths)
.configureSSHAgent: &configureSSHAgent |-
    eval $(ssh-agent -s)
    echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    mkdir -p ~/.ssh
    ssh-keyscan $DEPLOYMENT_SERVER >> ~/.ssh/known_hosts
    chmod 700 ~/.ssh

Deploy:
    stage: deploy
    # Tags are useful to only use runners that are safe or meet specific requirements
    image:
        name: ghcr.io/shopware/shopware-cli:latest
        entrypoint: [ "/bin/sh", "-c" ]
    before_script:
        # First, we need to execute all commands that are defined in the `configureSSHAgent` variable.
        - *configureSSHAgent
    script:
        # This command installs all dependencies and builds the project.
        - shopware-cli project ci .
        # This command starts the workflow that is defined in the `deploy` task in the `deploy.php`.
        # `production` is the stage that was defined in the `host` in the `deploy.php`
        - vendor/bin/dep deploy
```

### .github/workflows/deploy.yml

```yaml
name: Deployment
on:
  push:
    branches: main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'

      - name: Install Shopware CLI
        uses: shopware/shopware-cli-action@v1

      - name: Build
        run: shopware-cli project ci .

      - name: Deploy
        uses: deployphp/action@v1
        with:
          dep: deploy
          private-key: ${{ secrets.SSH_PRIVATE_KEY }}
```

### deploy.php

```php
<?php

namespace Deployer;

require_once 'recipe/common.php';
require_once 'contrib/cachetool.php';

set('bin/console', '{{bin/php}} {{release_or_current_path}}/bin/console');

set('cachetool', '/run/php/php-fpm.sock');
set('application', 'Shopware 6');
set('allow_anonymous_stats', false);
set('default_timeout', 3600); // Increase when tasks take longer than that.

// Hosts

host('SSH-HOSTNAME')
    ->setLabels([
        'type' => 'web',
        'env'  => 'production',
    ])
    ->setRemoteUser('www-data')
    ->set('deploy_path', '/var/www/shopware')
    ->set('http_user', 'www-data') // Not needed, if the `user` is the same, the webserver is running with
    ->set('writable_mode', 'chmod')
    ->set('keep_releases', 3); // Keeps 3 old releases for rollbacks (if no DB migrations were executed) 

// These files are shared among all releases.
set('shared_files', [
    '.env.local',
    'install.lock',
    'public/.htaccess',
    'public/.user.ini',
]);

// These directories are shared among all releases.
set('shared_dirs', [
    'config/jwt',
    'files',
    'var/log',
    'public/media',
    'public/plugins',
    'public/thumbnail',
    'public/sitemap',
]);

// These directories are made writable (the definition of "writable" requires attention).
// Please note that the files in `config/jwt/*` receive special attention in the `sw:writable:jwt` task.
set('writable_dirs', [
    'config/jwt',
    'custom/plugins',
    'files',
    'public/bundles',
    'public/css',
    'public/fonts',
    'public/js',
    'public/media',
    'public/sitemap',
    'public/theme',
    'public/thumbnail',
    'var',
]);

task('sw:deployment:helper', static function() {
   run('cd {{release_path}} && vendor/bin/shopware-deployment-helper run');
});

task('sw:touch_install_lock', static function () {
    run('cd {{release_path}} && touch install.lock');
});

task('sw:health_checks', static function () {
    run('cd {{release_path}} && bin/console system:check --context=pre_rollout');
});

desc('Deploys your project');
task('deploy', [
    'deploy:prepare',
    'deploy:clear_paths',
    'sw:deployment:helper',
    "sw:touch_install_lock",
    'sw:health_checks',
    'deploy:publish',
]);

task('deploy:update_code')->setCallback(static function () {
    upload('.', '{{release_path}}', [
        'options' => [
            '--exclude=.git',
            '--exclude=deploy.php',
            '--exclude=node_modules',
        ],
    ]);
});

// Hooks
after('deploy:failed', 'deploy:unlock');
after('deploy:symlink', 'cachetool:clear:opcache');
```
