---
nav:
  title: Configuration
  position: 19

---

# Deployment Helper Configuration

The Deployment Helper can be configured via a `.shopware-project.yml` file in the root of your project. Configure only the keys you use. Every section is optional.

## Basic configuration

A minimal file that manages extensions from code and sets a Store license domain looks like this:

```yaml
deployment:
  extension-management:
    enabled: true
  store:
    license-domain: 'example.com'
```

## Full configuration reference

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

  # Automatically installs and updates all extensions included in custom/plugins, custom/apps, and Composer.
  # When enabled, extensions installed at runtime (e.g., via the Store in Administration) may cause
  # conflicts during deployment. See "Extension management and Store-installed plugins" section below.
  extension-management:
    enabled: true

    # These extensions are not managed, you should use one-time-tasks to manage them
    exclude:
      - Name

    # These extensions are always updated even if their version does not change
    # This is useful for project-specific plugins that are not versioned
    force-update:
      - Name

    overrides:
      # The key is the extension name (app or plugin)
      MyPlugin:
        # Same as exclude
        state: ignore

      AnotherPlugin:
        # This plugin can be installed but should be inactive
        state: inactive

      RemoveThisPlugin:
        # This plugin will be uninstalled if it is installed
        state: remove
        # Keep data of an uninstalled extension
        keepUserData: true

  one-time-tasks:
    - id: foo
      # "before" runs prior to system:update; "after" runs once the update completes (default).
      when: after # defaults to after
      script: |
        # runs one time in deployment, then never again
        ./bin/console --version

  store:
    license-domain: 'example.com'

  # Automatically runs `system:setup:staging --no-interaction --force` after deployment
  # and extension management has completed, as a `PostDeploy` event listener.
  # Use this on staging environments, so the instance is switched into staging mode
  # on every deployment. See "Staging Mode Integration" below.
  staging:
    enabled: false

  # Enable maintenance mode during updates. When enabled, the storefront is put into
  # maintenance mode before running `system:update:finish` and restored afterwards.
  # Both enable and disable operations are followed by a cache clear.
  maintenance:
    enabled: false

  # Clear the HTTP and object cache after every deployment (via post-deploy listener).
  # This is independent of the maintenance-mode cache clears.
  cache:
    always_clear: false

  # Theme compilation configuration
  theme-compile:
    parallel: false
    workers: null  # auto-detected if not set
```

## Hooks: timing and use cases

Hooks allow you to run custom scripts at defined points in the deployment flow. Each hook fires at a specific moment, before or after a key step. Hooks are useful for:

- Running custom commands after plugins are installed (e.g., seed data, theme compilation beyond the default)
- Triggering external systems (Slack notifications, deployment webhooks)
- Custom health checks or warm-up steps

Hook execution order (both install and update flows):

1. **`pre`**: Before any deployment step (general setup, notifications)
2. **`pre-install` or `pre-update`**: Just before Shopware install/update begins
3. *(system:install or system:update:finish runs here)*
4. *(extension management runs here)*
5. **`post-install` or `post-update`**: After Shopware is set up and extensions are managed
6. **`post`**: Last, after all deployment steps and post-deploy listeners (cache clear, Fastly update) have run

## Multi-step hooks

Each hook can either be a single script (as shown above) or a list of steps that are executed individually. Splitting a hook into steps gives clearer output during deployment, as each step is run and reported separately.

A step can be an object with a `title` and a `script`, where the `title` is shown in the deployment output:

```yaml
deployment:
  hooks:
    post:
      - title: Warm up the cache
        script: |
          %php.bin% bin/console cache:warmup
      - title: Notify the team
        script: ./notify.sh
```

As shorthand, a step can also be a plain script string (without a title):

```yaml
deployment:
  hooks:
    pre-update:
      - echo "first step"
      - echo "second step"
```

The single-script form remains fully supported, so existing configurations keep working unchanged.

### Using `%php.bin%` in custom scripts

When writing custom scripts in hooks or one-time tasks, use `%php.bin%` instead of bare `php` to ensure the **same PHP version** that Deployment Helper is running under.

This matters when:

- Your server has multiple PHP versions installed (e.g., `php`, `php74`, `php81`)
- Your CI/CD pipeline uses a specific version
- Your Shopware installation requires a minimum version

Examples:

```yaml
deployment:
  hooks:
    post:
      - |
        # Correct: uses the same PHP version as DH
        %php.bin% bin/console cache:warmup
        
        # Avoid: might use a different PHP version
        php bin/console cache:warmup
        
  one-time-tasks:
    - id: fix-data
      script: |
        %php.bin% bin/console custom:fix-data
```

If your script doesn't use PHP (e.g., shell scripts, Node.js), `%php.bin%` is unnecessary.

## Force-update plugins and apps

The `force-update` list causes extensions to be reinstalled even if their version hasn't changed. This is useful for project-specific plugins that don't follow semantic versioning or need to be regenerated on every deployment.

```yaml
deployment:
  extension-management:
    force-update:
      - MyCustomPlugin
      - MyApp
```

Without this, Deployment Helper only updates extensions when version in the codebase is newer than installed version. With `force-update`, the extension is always rebuilt and reinstalled.

## Theme compilation and parallelization

By default, Deployment Helper compiles the active theme(s) at the end of deployment. Theme compilation can be:

- **Skipped entirely**: `--skip-theme-compile` if your CI/CD already compiled the theme
- **Parallelized**: across multiple sales channels for shops with many storefronts

### Serial compilation (default)

```bash
vendor/bin/shopware-deployment-helper run
```

Runs `theme:compile --active-only` once, compiling all active themes sequentially.

### Parallel compilation

Requires Shopware 6.5.6+ and optional configuration:

```yaml
deployment:
  theme-compile:
    parallel: true
    workers: 4  # optional, auto-detected if not set
```

Deployment Helper then:

1. Detects CPU count automatically (or uses configured `workers`)
2. Seeds each unique theme once (single-threaded to avoid temp file races)
3. Compiles sales channels in parallel (up to `workers` at a time)

This significantly speeds up deployment for shops with many sales channels.

## Local configuration overrides

You can create a `.shopware-project.local.yml` file alongside your `.shopware-project.yml` to override configuration values for local development without modifying the base config. This file should be added to your `.gitignore`.

The local file is deep-merged on top of the base configuration:

- **Scalar values** (strings, numbers) are replaced by the local value.
- **Maps** (associative arrays) are deep-merged recursively.
- **Lists** (indexed arrays): for each list-valued key, the list from `.shopware-project.local.yml` is appended to the end of the list from `.shopware-project.yml`. The relative order of items within each list is preserved, nested lists are treated the same way, and no automatic deduplication is performed.

```yaml
# .shopware-project.local.yml
deployment:
  hooks:
    pre: |
      echo "Local pre hook"

  store:
    license-domain: local.example.com

  one-time-tasks:
    - id: local-task
      script: echo "additional local task"
```

### YAML tags for advanced merging

The local config file supports custom YAML tags to control how values are merged. These tags (such as `!reset` and `!override`) are interpreted by the Deployment Helper itself and are not part of the YAML standard.

> Note: Generic YAML parsers or linters that are not configured to allow custom tags may emit errors or warnings when loading `.shopware-project.local.yml`. Ensure your tooling supports custom tags or excludes this file, and use a Deployment Helper version that documents support for `!reset` and `!override` (see the Deployment Helper changelog for the minimum supported version).

#### `!reset`: clear and replace a field

Use `!reset` on a single field to ignore the value from the base configuration and use only the tagged value. It can be applied to scalars, lists, or maps, and it affects only that one field: the parent object is still merged as usual, but the value for this key is completely replaced. For lists, all inherited items are dropped; for maps, only the keys you define remain for that field.

```yaml
# .shopware-project.local.yml
deployment:
  extension-management:
    # Resets just this exclude field: the base exclude list is discarded and replaced
    exclude: !reset
      - OnlyThisPlugin

  # Resets the one-time-tasks field: all inherited tasks are removed, and only these remain
  one-time-tasks: !reset
    - id: only-task
      script: only-script
```

#### `!override`: fully replace a section

Use `!override` on a mapping/section to disable deep-merging for that whole mapping. The tagged section completely replaces the corresponding section from the base configuration: nested keys are not merged recursively, and any keys that are not listed in the overriding section are removed.

```yaml
# .shopware-project.local.yml
deployment:
  # Overrides the entire hooks section: all hooks from the base config are removed
  hooks: !override
    pre: |
      echo "Only this hook"
```
