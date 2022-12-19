# Theme Build

The entire build process is performed without an active database connection. However, for theme builds, Shopware needs to access the theme configuration. We make it available by checking it into our VCS repository. This process must be performed **after** you first installed Shopware in your PaaS environment because it runs a command that requires an existing database that was not created on the first run.

## Dump configuration

First of all, we need to dump the theme configuration.

```bash
shopware ssh -A app 'bin/console theme:dump'
```

This will connect to the application through an SSH tunnel and run a command which dumps the theme configuration into the remote `files/theme-config/` directory.

## Download configuration

Because we want to check the theme configuration into our VCS repository, we have to download it first.

```bash
shopware mount:download --mount 'files' --target 'files' -A app
```

This will download the remote directory `files` into our local directory `files`. The `-A` parameter specifies the app name, which is just `app` in our case.

## Push configuration

Eventually, we add the downloaded configuration and add it to our repository.

```bash
git add files/theme-config
git commit -m 'Update theme configuration'
git push # platform main
```

Again, if you push changes to `platform main`, it will trigger a redeploy. After this, your theme assets will be compiled properly and the deployed store will look fine.
