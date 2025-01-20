---
nav:
  title: Extension Validation
  position: 1

---

# Extension Validation

Shopware-CLI has an builtin validation for extensions. This is useful in your CI/CD pipeline to validate the extension before you release it.

## Validating an extension

To validate an extension, you can use the following command:

```bash
shopware-cli extension validate <path>
```

The path can be absolute or relative to the directory containing the extension or the zip file. The command exists with a non-zero exit code if the validation fails with a error level message.

## What is validated?

- The composer.json has an `shopware/core` requirement and constraint is parsable
- The extension metadata is filled:
  - `name`
  - `label` (German and English)
  - `description` (German and English) and longer than 150 characters and shorter than 185 characters
- Translations have equality translated in the given languages
- PHP can be correctly linted with the minimum PHP version
- The theme.json can be parsed and included assets can be found

## Supported PHP versions for linting

Following PHP versions are supported for linting:

- 7.3
- 7.4
- 8.1
- 8.2

These versions don't need to be installed locally, they are downloaded on demand and executed using WebAssembly without any dependencies.
