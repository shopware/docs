---
nav:
  title: Configuration
  position: 5

---

# Configuration

Many configuration can be changed using a `.shopware-extension.yml` file in the root of your extension.

Here is a example of a `.shopware-extension.yml` file:

```yaml
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

When you edit that file in a Editor, you will get autocompletion and hints for the available options.

## Environment variables

Additionally, you can set environment variables to change the behavior of the CLI. The following environment variables are available:

| Environment Variable           | Description                                                                                   |
|-------------------------------|-----------------------------------------------------------------------------------------------|
| CI                            | Detect CI environment                                                                         |
| SHOPWARE_CLI_PREVIOUS_TAG     | Override previous Git tag detection with a previous tag used for Changelog generation         |
| CI_PROJECT_URL                | GitLab CI project URL used for Changelog generation                                           |
| SHOPWARE_CLI_NO_SYMFONY_CLI   | Disable Symfony CLI usage                                                                    |
| APP_ENV                       | Application environment                                                                      |
| SHOPWARE_PROJECT_ROOT         | Use this Shopware project to build the extension instead of setting up a new project         |
| SHOPWARE_CLI_DISABLE_WASM_CACHE | Disable the WASM cache for PHP linting                                                                        |
