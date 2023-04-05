# Deployment with Deployer

## Overview

Automized deployments shouldn't be a pain and have several advantages, like lower failure rates and reproducible builds. Also, they increase overall productivity because actual testing can get more attention.

This article explains the fundamental steps to deploy Shopware 6 to a certain infrastructure, focussing on continuous deployment using [GitLab CI](https://docs.gitlab.com/ee/ci/) and [Deployer](https://deployer.org/) (a deployment tool written in PHP).

## Video

<YoutubeRef video="Oo-KvyxJvpo" title="Continuous Deployment: Automizing Shopware 6 deployments (Developer Tutorial) - YouTube" target="_blank" />

## Prerequisites

Please make sure you already have a working Shopware 6 instance running and that your repository is based on the Shopware production template because this article relies on some scripts to exist in your repository.

<PageRef page="https://github.com/shopware/production" title="shopware/production @ GitHub" target="_blank" />

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

For more information, refer to [Migrating existing instance to Deployer structure](deployment-with-deployer.md#migrating-existing-instance-to-deployer-structure).

### Webserver configuration

Ensure to set the document root of the domain to `/var/www/shopware/current/public`, assuming `/var/www/shopware` is the path you are uploading Shopware to, but this can, of course, differ. The most important part of this path is `current`, which is the symlink to the currently active release.

Because `current` is a symlink, please also make sure your web server is configured to resolve/follow symlinks correctly.

## GitLab runner requirements

[GitLab pipelines](https://docs.gitlab.com/ee/ci/pipelines/) are processed by [runners](https://docs.gitlab.com/runner/). Once a pipeline job is created, GitLab notifies a registered runner, and the job will then be processed by that runner.

The [GitLab runner](https://docs.gitlab.com/runner/) must have the following packages installed:

* PHP \(see supported versions in the [System Requirements](https://docs.shopware.com/en/shopware-6-en/first-steps/system-requirements#environment)\)
* [NodeJS](https://nodejs.org/en/)
* [Node Package Manager \(npm\)](https://www.npmjs.com/)
* OpenSSH

This example uses the docker image `shopware/development:latest`. This image meets all requirements.

## Deployment steps

### 1. Cloning the repository

The very first step in the pipeline is cloning the repository into the runner's workspace. GitLab does that automatically for every started job.

### 2. Installing dependencies

All the dependencies of your project must be installed. Shopware 6 uses [Composer](https://getcomposer.org/) for managing PHP dependencies and [Node Package Manager \(NPM\)](https://www.npmjs.com/) for frontend related dependencies.

Initially, only the Composer dependencies need to be installed by running the following commands:

* `$ composer install --no-interaction --optimize-autoloader --no-suggest`
* `$ composer install -d vendor/shopware/recovery --no-interaction --optimize-autoloader --no-suggest`

This step is defined in the `Install dependencies` job in the [`.gitlab-ci.yml`](deployment-with-deployer.md#gitlab-ci-yml):

```text
Install dependencies:
    stage: build
    image: shopware/development:latest
    script:
        - composer install --no-interaction --optimize-autoloader --no-suggest
        - composer install -d vendor/shopware/recovery --no-interaction --optimize-autoloader --no-suggest
    cache:
        key: ${CI_COMMIT_REF_SLUG}
        paths:
            - vendor/
        policy: push
```

### 3. Building assets

::: info
From this step on, all other steps are handled by Deployer defined in the [`deploy.php`](deployment-with-deployer.md#deploy-php).
:::

To compile and copy assets, the Shopware production template provides a script, which is located under [`bin/build-js.sh`](https://github.com/shopware/production/blob/6.3/bin/build-js.sh). This script installs the [NPM](https://www.npmjs.com/) dependencies and builds assets needed for the Administration, Storefront, and plugins.

It is important to know that you need a database connection to execute this script because before compiling the assets, the console command `bin/console bundle:dump` is executed. This command creates the file `var/plugins.json`, which contains information about the asset paths of all activated plugins.

If you don't want to build the assets on the target server \(for performance reasons\), you could execute the `bundle:command` on the target server and download the generated `plugins.json` into your runner's workspace before executing [`bin/build-js.sh`](https://github.com/shopware/production/blob/6.3/bin/build-js.sh).

This step is defined to be executed on the target server in the `sw:build` job in the [`deploy.php`](deployment-with-deployer.md#deploy-php) and will be executed before transferring the files to the target server:

```php
task('sw:build', static function () {
    run('cd {{release_path}} && bash bin/build-js.sh');
});
```

### 4. Transferring the workspace

For transferring the files to the target server, please configure at least one host in the [`deploy.php`](deployment-with-deployer.md#deploy-php):

```php
host('SSH-HOSTNAME')
    ->stage('production')
    ->user('SSH-USER')
    ->set('deploy_path', '/var/www/shopware') // This is the path, where deployer will create its directory structure
    ->set('http_user', 'www-data') // Not needed, if the `user` is the same user, the webserver is running with 
    ->set('writable_mode', 'chmod');
```

This step is defined in the `deploy:update_code` job in the [`deploy.php`](deployment-with-deployer.md#deploy-php):

```php
task('deploy:update_code', static function () {
    upload('.', '{{release_path}}');
});
```

### 5. Applying migrations

The migrations need to be applied on the target server.

::: danger
If you are deploying to a cluster with multiple web servers, please make sure to run the migrations only on one of the servers.
:::

This step is defined in the `sw:database:migrate` job in the [`deploy.php`](deployment-with-deployer.md#deploy-php), which is part of the `sw:deploy` task group:

```php
task('sw:database:migrate', static function () {
    run('cd {{release_path}} && bin/console database:migrate --all');
});
```

### 6. Warming up caches

If you have the HTTP cache enabled in your `.env` file, it is recommended to warm up the caches so that the first user, who visits the recently deployed version, doesn't have to wait until the page is rendered for the first time.

This step is defined in the `sw:cache:warmup` job in the [`deploy.php`](deployment-with-deployer.md#deploy-php):

```php
task('sw:cache:warmup', static function () {
    run('cd {{release_path}} && bin/console cache:warmup');
    run('cd {{release_path}} && bin/console http:cache:warm:up');
});
```

### 7. Creating the `install.lock` file

Before putting the new version live, ensure to create an empty file `install.lock` in the root of the build workspace. Otherwise, Shopware will redirect every request to the Shopware installer because it assumes that Shopware isn't installed yet.

This task is defined in the `sw:touch_install_lock` job in the [`deploy.php`](deployment-with-deployer.md#deploy-php), which is part of the `sw:deploy` task group:

```php
task('sw:touch_install_lock', static function () {
    run('cd {{release_path}} && touch install.lock');
});
```

### 8. Switching the document root

After all the steps are done, Deployer will switch the symlinks destination to the new release.

This task is defined in the `deploy:symlink` default job in the [`deploy.php`](deployment-with-deployer.md#deploy-php).

## Deployer output

This is the output of `dep deploy production`:

```text
$ dep deploy production               

✔ Executing task deploy:prepare
✔ Executing task deploy:lock
✔ Executing task deploy:release
✔ Executing task deploy:update_code
✔ Executing task deploy:shared
✔ Executing task sw:touch_install_lock
✔ Executing task sw:build
✔ Executing task sw:database:migrate
✔ Executing task sw:theme:compile
✔ Executing task sw:cache:clear
✔ Executing task deploy:writable
✔ Executing task deploy:clear_paths
✔ Executing task sw:cache:warmup
✔ Executing task deploy:symlink
✔ Executing task deploy:unlock
✔ Executing task cleanup
Successfully deployed!
```

## Migrating existing instance to Deployer structure

After the very first deployment with Deployer, you have to copy some files and directories from your existing Shopware instance into the directory structure, that was created by Deployer.

Let's agree on the following two paths for the examples:

1. You have copied your existing Shopware instance to `/var/www/shopware_backup`.
1. You have set the `deploy_path` in the [`deploy.php`](deployment-with-deployer.md#deploy-php) to `/var/www/shopware`.

Now, look at the `shared_files` and `shared_dirs` configurations in the [`deploy.php`](deployment-with-deployer.md#deploy-php). Simply copy all the paths into `/var/www/shopware/shared`. For the configuration of the `deploy.php` the commands would be the following:

```bash
cp /var/www/shopware_backup/.env /var/www/shopware/shared/
cp -R /var/www/shopware_backup/custom/plugins /var/www/shopware/shared/custom
cp -R /var/www/shopware_backup/config/jwt /var/www/shopware/shared/config
cp -R /var/www/shopware_backup/config/packages /var/www/shopware/shared/config
cp -R /var/www/shopware_backup/files /var/www/shopware/shared
cp -R /var/www/shopware_backup/var/log /var/www/shopware/shared/var
cp -R /var/www/shopware_backup/public/media /var/www/shopware/shared/public
cp -R /var/www/shopware_backup/public/thumbnail /var/www/shopware/shared/public
cp -R /var/www/shopware_backup/public/sitemap /var/www/shopware/shared/public
```

## Sources

Have a look at the following files. All steps are provided with helpful comments.

### .gitlab-ci.yml

```yaml
# This file defines the GitLab CI/CD pipeline.
# For more information, please visit the GitLab CI/CD docs: https://docs.gitlab.com/ee/ci/README.html
variables:
    GIT_STRATEGY: clone

# Stages define _when_ to run the jobs. For example, stages that run tests after stages that compile the code.
# If _all_ jobs in a stage succeed, the pipeline moves on to the next stage.
# If _any_ job in a stage fails, the next stage is not (usually) executed and the pipeline ends early.
stages:
    - build
    - deploy

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

Install dependencies:
    stage: build
    image: shopware/development:latest
    script:
        - composer install --no-interaction --optimize-autoloader --no-suggest
        - composer install -d vendor/shopware/recovery --no-interaction --optimize-autoloader --no-suggest

    # This tells the GitLab Runner to upload (`policy: push`) the `vendor` directory, which contains all Composer
    # dependencies to GitLab after the job has finished so that it can be re-used in other jobs.
    cache:
        key: ${CI_COMMIT_REF_SLUG}
        paths:
            - vendor/
        policy: push

Deploy:
    stage: deploy
    image: shopware/development:latest
    only:
        - master
    before_script:
        # First, we need to execute all commands that are defined in the `configureSSHAgent` variable.
        - *configureSSHAgent
        # To use Deployer for our deployment, it needs to be installed globally via Composer.
        - composer global require deployer/deployer
    script:
        # This command starts the workflow that is defined in the `deploy` task in the `deploy.php`.
        # `production` is the stage that was defined in the `host` in the `deploy.php`
        - dep deploy production

    # This tells the GitLab Runner to download (`policy: pull`) the `vendor` directory, which contains all Composer
    # dependencies into the runner's workspace before the job starts.
    # The cache entry was created by the `Install dependencies` job.
    cache:
        key: ${CI_COMMIT_REF_SLUG}
        paths:
            - vendor/
        policy: pull
```

### deploy.php

```php
<?php

namespace Deployer;

require_once 'recipe/common.php';

set('application', 'Shopware 6');
set('allow_anonymous_stats', false);
set('default_timeout', 3600); // Increase the `default_timeout`, if needed when tasks take longer than the limit.

// For more information, please visit the Deployer docs: https://deployer.org/docs/configuration.html
host('SSH-HOSTNAME')
    ->stage('production')
    ->user('SSH-USER')
    ->set('deploy_path', '/var/www/shopware')
    ->set('http_user', 'www-data') // Not needed, if the `user` is the same user, the webserver is running with
    ->set('writable_mode', 'chmod');

// For more information, please visit the Deployer docs: https://deployer.org/docs/configuration.html#shared_files
set('shared_files', [
    '.env',
]);

// For more information, please visit the Deployer docs: https://deployer.org/docs/configuration.html#shared_dirs
set('shared_dirs', [
    'custom/plugins',
    'config/jwt',
    'files',
    'var/log',
    'public/media',
    'public/thumbnail',
    'public/sitemap',
]);

// For more information, please visit the Deployer docs: https://deployer.org/docs/configuration.html#writable_dirs
set('writable_dirs', [
    'custom/plugins',
    'config/jwt',
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

// This task uploads the whole workspace to the target server
task('deploy:update_code', static function () {
    upload('.', '{{release_path}}');
});

// This task remotely creates the `install.lock` file on the target server.
task('sw:touch_install_lock', static function () {
    run('cd {{release_path}} && touch install.lock');
});

// This task remotely executes the `bin/build-js.sh` script on the target server.
task('sw:build', static function () {
    run('cd {{release_path}} && bash bin/build-js.sh');
});

// This task remotely executes the `theme:compile` console command on the target server.
task('sw:theme:compile', static function () {
    run('cd {{release_path}} && bin/console theme:compile');
});

// This task remotely executes the `cache:clear` console command on the target server.
task('sw:cache:clear', static function () {
    run('cd {{release_path}} && bin/console cache:clear');
});

// This task remotely executes the cache warmup console commands on the target server so that the first user, who
// visits the website doesn't have to wait for the cache to be built up.
task('sw:cache:warmup', static function () {
    run('cd {{release_path}} && bin/console cache:warmup');
    run('cd {{release_path}} && bin/console http:cache:warm:up');
});

// This task remotely executes the `database:migrate` console command on the target server.
task('sw:database:migrate', static function () {
    run('cd {{release_path}} && bin/console database:migrate --all');
});

/**
 * Grouped SW deploy tasks
 */
task('sw:deploy', [
    'sw:touch_install_lock',
    'sw:build',
    'sw:database:migrate',
    'sw:theme:compile',
    'sw:cache:clear',
]);

/**
 * Main task
 */
task('deploy', [
    'deploy:prepare',
    'deploy:lock',
    'deploy:release',
    'deploy:update_code',
    'deploy:shared',
    'sw:deploy',
    'deploy:writable',
    'deploy:clear_paths',
    'sw:cache:warmup',
    'deploy:symlink',
    'deploy:unlock',
    'cleanup',
    'success',
])->desc('Deploy your project');

after('deploy:failed', 'deploy:unlock');
```
