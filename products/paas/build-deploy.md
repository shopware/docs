# Build and Deploy

Now that we have set up the repository, we are ready to push changes to your PaaS environment.

The key concept is that your PaaS project is a git repository. Every time you push to that repository, a new version of your store will be created from the source code and deployed. Different environments (e.g., dev-previews, staging, and production) are mapped by corresponding branches.

## Push main branch

To push your latest changes, run the following commands from your terminal:

```bash{3}
git add .
git commit -m "Applied new configuration"
git push -u platform main
```

First, we stage all changes and then add them as a new commit. Then, we push them to our `platform` origin (remember, the one for our PaaS environment) on the `main` branch.

This will trigger a new build with a subsequent deploy consisting of the following steps:

| Build | Deploy |
| --- | --- |
| Configuration validation | Hold app requests |
| Build container image | Unmount live containers |
| Installing dependencies | Mount file systems |
| Run [build hook](./setup-template.md#build-hook) | Run [deploy hook](./setup-template.md#deploy-hook) |
| Building app image | Serve requests |

After both steps have been executed successfully (you will get extensive logging about the process), you will be able to see the deployed store on a link presented at the end of the deployment.

## First deployment

{% hint style="warning" %}
**Theme Assets**

It is a known issue that after the first deployment, theme assets are not compiled during the deployment. For that reason, your store will look unstyled. The [Theme Build](./theme-build.md) section explains how to resolve that issue.
{% endhint %}

The first time the site is deployed, Shopware's command line installer will run and initialize Shopware. It will not run again unless the `installer/installed` file is removed. **Do not remove that file unless you want the installer to run on the next deploy.**

The installer will create an administrator account with the default credentials.

| username | password |
|---|---|
| `admin` | `shopware` |

Make sure to change this password immediately in your Administration account settings. Not doing so is a security risk.

## Composer authentication

You must authenticate yourself to install extensions from the Shopware store via composer. In your local development environment, this is possible by creating an `auth.json` file that contains your auth token. However, this file shouldn't be committed to the repository.

The following command adds your authentication token to the secure environment variable storage of Shopware Paas. This variable (contains the content which would otherwise be in `auth.json`) will be available during the build step and be automatically picked up by the composer.

```bash
shopware variable:create --level project --name env:COMPOSER_AUTH --json true --visible-runtime false --sensitive true --visible-build true --value '{"bearer": {"packages.shopware.com": "%place your key here%"}}'
```

Make sure to replace `%place your key here%` with your actual token. You can find your token by clicking 'Install with Composer' in your Shopware Account.
