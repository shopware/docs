---
nav:
  title: Extracting Meta Data
  position: 4

---

# Extracting Meta Data

There are helpers in Shopware CLI to extract data of an extension. This is useful in your CI/CD pipeline to get the extension version or the changelog for the automated release.

## Extracting the version

To extract the version of an extension, you can use the following command:

```bash
shopware-cli extension get-version <path>
```

The path can be absolute or relative to the current working directory. The command will output the version of the extension.

## Extracting the changelog

To extract the changelog of an extension, you can use the following command:

```bash
shopware-cli extension get-changelog <path>
```

The path can be absolute or relative to the current working directory. The command will output the changelog of the extension.

It will output always the English changelog.
