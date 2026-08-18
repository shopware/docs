---
nav:
  title: Commands and Reference
  position: 23

---

# Commands, Options, and Best Practices

## Available commands

The [Deployment Helper](deployment-helper.md) ships with the following commands:

| Command | Description |
|---|---|
| `run` | Install or update Shopware (the main deployment command) |
| `is-installed` | Check whether Shopware is installed; exits `0` if installed, `1` if not. Useful as a guard in shell scripts |
| `one-time-task:list` | List all one-time tasks and their execution status |
| `one-time-task:mark <id>` | Mark a one-time task as executed without running it |
| `one-time-task:unmark <id>` | Remove the mark from a one-time task so it runs again on the next deployment |
| `fastly:snippet:list` | List all deployed Fastly VCL snippets |
| `fastly:snippet:deploy` | Deploy all Fastly VCL snippets manually |
| `fastly:snippet:remove <name>` | Remove a Fastly VCL snippet by name |

### Using the `is-installed` command

The `is-installed` command is a guard to conditionally run `run` in shell scripts. This is useful when your deployment process needs to handle fresh installs and updates differently.

```bash
#!/bin/bash
set -e

# Load environment
export DATABASE_URL="mysql://..."
export APP_URL="https://example.com"

# Check if installed
if ! ./vendor/bin/shopware-deployment-helper is-installed; then
  echo "Shopware not installed, running fresh install..."
  export INSTALL_ADMIN_PASSWORD="your-secure-password"
  export INSTALL_ADMIN_EMAIL="admin@example.com"
fi

# Run the main deployment
./vendor/bin/shopware-deployment-helper run
```

Exit codes:

- `0` – Shopware is installed (user + sales channel exist)
- `1` – Shopware is not installed or database unreachable

## Run command options

The `run` command accepts the following options:

| Option | Description |
|---|---|
| `--skip-theme-compile` | Skip theme compilation (use when the theme was already compiled in CI/CD) |
| `--skip-assets-install` | Skip asset installation (use when assets were already copied in CI/CD) |
| `--skip-asset-install` | Deprecated alias for `--skip-assets-install` |
| `--timeout=<seconds>` | Set script execution timeout in seconds. Set to `null` to disable. Takes precedence over `SHOPWARE_DEPLOYMENT_TIMEOUT`, which in turn defaults to `300` (see [`RunCommand`](https://github.com/shopware/deployment-helper/blob/main/src/Command/RunCommand.php)). |
| `--project-config=<path>` | Path to a custom `.shopware-project.yml` file (absolute or relative to project root) |

`run` returns a non-zero exit code if any step fails. In CI/CD, treat a non-zero exit as a failed deployment and stop the rollout.

## Best practices: multi-environment deployments

### One config file, environment variables for differences

Use a single `.shopware-project.yml` for all environments (production, staging, dev). Override environment-specific settings via environment variables in your CI/CD:

```yaml
# .shopware-project.yml (committed)
deployment:
  store:
    license-domain: 'example.com'
  staging:
    enabled: false  # default to false
  hooks:
    post: |
      echo "Deployment complete"
```

```bash
# CI/CD: set per-environment
# Staging: enable staging mode
export SHOPWARE_DEPLOYMENT_STAGING=1

# Production: disable it (default)
# export SHOPWARE_DEPLOYMENT_STAGING=0
```

This avoids multiple YAML files and keeps configuration close to where it's used (CI/CD platform).

### Avoid data leaks after production copy

When you copy the production database to staging:

1. Deploy the same code version to staging.
2. Enable staging mode in your deployment:

   ```bash
   export SHOPWARE_DEPLOYMENT_STAGING=1
   ```

3. Verify emails are disabled and app connections are reset.

Staging mode is not automatic. If skipped, staging becomes production and can leak data.

### Test extensions in staging first

Before deploying new extensions to production:

1. Deploy to staging with the new extension.
2. Test in the Admin and Storefront.
3. If an app (not a plugin), verify app connections work.
4. Once validated, deploy to production.

Extensions are managed automatically, so this is just a testing step.

### Watch for cache over-reliance

Some teams over-clear the cache (set `always_clear: true` on every deployment) because they assume it solves issues. In reality:

- Smart cache clearing (default) clears only when needed, improving deploy speed.
- Unnecessary cache clears slow deployments and can mask real issues.

Only enable `always_clear` if you have a specific reason (e.g., custom caching logic in hooks).

### One-time tasks are version-control, not manual ops

Include one-time tasks in your `.shopware-project.yml` and commit them to Git. This way:

- Developers see what migrations exist in the codebase.
- The task runs automatically on production with no manual steps.
- History is tracked (when it ran, what it did).

Avoid running migrations manually on production; let Deployment Helper and CI/CD handle it.
