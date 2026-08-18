---
nav:
  title: Extracting Meta Data
  position: 4

---

# Extracting Meta Data

There are helpers in Shopware CLI to extract data of an extension. This is useful in your CI/CD pipeline to get the extension version, name, or the changelog for the automated release.

## Extracting the version

To extract the version of an extension, you can use the following command:

```bash
shopware-cli extension get-version <path>
```

The path can be absolute or relative to the current working directory. The command will output the version of the extension.

## Extracting the name

To extract the name of an extension, you can use the following command:

```bash
shopware-cli extension get-name <path>
```

The path can be absolute or relative to the current working directory. This is useful in CI/CD pipelines when you need to programmatically determine the extension identifier.

## Extracting the changelog

To extract the changelog of an extension, you can use the following command:

```bash
shopware-cli extension get-changelog <path>
```

The path can be absolute or relative to the current working directory. The command will output the changelog of the extension.

It will output always the English changelog.

## Configuration schema

To view the JSON schema for the `.shopware-extension.yml` configuration file, you can use:

```bash
shopware-cli extension config-schema
```

This outputs the JSON schema that describes all available configuration options in `.shopware-extension.yml`. This is particularly useful for AI agents and automation tools that need to understand the extension configuration structure.
