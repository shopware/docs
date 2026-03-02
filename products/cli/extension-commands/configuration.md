---
nav:
  title: Configuration
  position: 5

---

# Configuration

Many configurations can be changed using a `.shopware-extension.yml` file in the root of your extension.

Here is an example of a `.shopware-extension.yml` file:

```yaml
compatibility_date: '2026-02-11'

build:
  extraBundles:
    - path: src/Foo
    - name: OverrideName
      path: src/Override
  shopwareVersionConstraint: '~6.6.0'
  zip:
    assets:
      enabled: false
      before_hooks: []
      after_hooks: []
      disable_sass: false
      enable_es_build_for_admin: false
      enable_es_build_for_storefront: false
      npm_strict: false

changelog:
  enabled: true

store:
  automatic_bugfix_version_compatibility: true
  # ...

validation:
  ignore:
    - 'xx'
```

When you edit that file in an editor, you will get autocompletion and hints for the available options.

## compatibility_date

You can define a `compatibility_date` in `.shopware-extension.yml`:

```yaml
compatibility_date: '2026-02-11'
```

The `compatibility_date` lets Shopware CLI introduce behavior changes without breaking existing projects by default. New or potentially breaking changes are activated only for configurations that opt in with a date at or after the feature's rollout date.

- Format: `YYYY-MM-DD`
- If the field is missing, Shopware CLI uses `2026-02-11` as fallback
- When missing, Shopware CLI logs a warning during config loading

## Environment variables

Additionally, you can set environment variables to change the behavior of the CLI. The following environment variables are available:

| Environment Variable            | Description                                                                           |
|---------------------------------|---------------------------------------------------------------------------------------|
| CI                              | Detect CI environment                                                                 |
| SHOPWARE_CLI_PREVIOUS_TAG       | Override previous Git tag detection with a previous tag used for Changelog generation |
| CI_PROJECT_URL                  | GitLab CI project URL used for Changelog generation                                   |
| SHOPWARE_CLI_NO_SYMFONY_CLI     | Disable Symfony CLI usage                                                             |
| APP_ENV                         | Application environment                                                               |
| SHOPWARE_PROJECT_ROOT           | Use this Shopware project to build the extension instead of setting up a new project  |
| SHOPWARE_CLI_DISABLE_WASM_CACHE | Disable the WASM cache for PHP linting                                                |
