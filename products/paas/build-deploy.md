---
nav:
  title: Build & Deploy
  position: 30

---

# Build and Deploy

Now that we have set up the repository, we are ready to push changes to your PaaS environment.

The key concept is that your PaaS project is a git repository. Every time you push to that repository, a new version of your store will be created from the source code and deployed. Different environments (e.g., dev-previews, staging, and production) are mapped by corresponding branches.

## Push main branch

To push your latest changes, run the following commands from your terminal:

```bash{3}
git add .
git commit -m "Applied new configuration"
git push -u shopware main
```

First, we stage all changes and then add them as a new commit. Then, we push them to our `shopware` origin (remember, the one for our PaaS environment) on the `main` branch.

This will trigger a new build with a subsequent deploy consisting of the following steps:

| Build                                         | Deploy                                          |
|-----------------------------------------------|-------------------------------------------------|
| Configuration validation                      | Hold app requests                               |
| Build container image                         | Unmount live containers                         |
| Installing dependencies                       | Mount file systems                              |
| Run [build hook](./setup-template#build-hook) | Run [deploy hook](./setup-template#deploy-hook) |
| Building app image                            | Serve requests                                  |

After both steps have been executed successfully (you will get extensive logging about the process), you will be able to see the deployed store on a link presented at the end of the deployment.

## First deployment

The first time the site is deployed, Shopware's command line installer will run and initialize Shopware. It will not run again unless the `install.lock` file is removed. **Do not remove that file unless you want the installer to run on the next deploy.**

The installer will create an administrator account with the default credentials.

| username | password   |
|----------|------------|
| `admin`  | `shopware` |

Make sure to change this password immediately in your Administration account settings. Not doing so is a security risk.

## Composer authentication

You must authenticate yourself to install extensions from the Shopware store via composer. In your local development environment, this is possible by creating an `auth.json` file that contains your auth token. However, this file shouldn't be committed to the repository.

The following command adds your authentication token to the secure environment variable storage of Shopware Paas. This variable (contains the content which would otherwise be in `auth.json`) will be available during the build step and be automatically picked up by the composer.

```bash
shopware variable:create --level project --name env:COMPOSER_AUTH --json true --visible-runtime false --sensitive true --visible-build true --value '{"bearer": {"packages.shopware.com": "%place your key here%"}}'
```

Make sure to replace `%place your key here%` with your actual token. You can find your token by clicking 'Install with Composer' in your Shopware Account.

## Extending Shopware - plugins and apps

The PaaS recipe uses the [Composer plugin loader](../../guides/hosting/installation-updates/cluster-setup#composer-plugin-loader).

## Manually trigger rebuilds

Sometimes, you might want to trigger a rebuild and deploy of your environment without pushing new code to your project. To do this for your main environment, create a `REBUILD_DATE` environment variable. This triggers a build right away to propagate the variable.

```bash
shopware variable:create --environment main --level environment --prefix env --name REBUILD_DATE --value "$(date)" --visible-build true
```

To force a rebuild at any time, update the variable with a new value:

```bash
shopware variable:update --environment main --value "$(date)" "env:REBUILD_DATE"
```

This forces your application to be built even if no code has changed.
