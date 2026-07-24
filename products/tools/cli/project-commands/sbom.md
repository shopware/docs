---
nav:
  title: Generate a Project SBOM
  position: 6

---

# Generate a Project SBOM

The `shopware-cli project sbom` command generates a Software Bill of Materials (SBOM) for a Shopware project from `composer.lock`. The output is a [CycloneDX](https://cyclonedx.org/) 1.7 JSON document — the same artifact that `shopware-cli project ci` produces, without running the full CI build.

Use it for security reviews, vulnerability scanning, compliance exports, and release artifacts when you only need the SBOM and not a deployable build.

## Usage

```bash
# Write sbom.cdx.json into the current Shopware project
shopware-cli project sbom

# Explicit project path, format, and output file
shopware-cli project sbom ./my-shop \
  --format cyclonedx-json \
  --output sbom.json

# Include packages-dev from composer.lock
shopware-cli project sbom --include-dev-dependencies
```

If you omit the path argument, Shopware CLI resolves the nearest Shopware project (by walking for `composer.json` / `composer.lock`) and falls back to the current working directory.

## What does it do?

- Reads `composer.lock` (and optionally `composer.json` for the root component name and version)
- Builds a CycloneDX 1.7 JSON SBOM of Composer packages
- Writes the document to the configured output path (default: `sbom.cdx.json` in the project root)
- Exits non-zero with a clear error when `composer.lock` is missing or unreadable

By default, packages from `packages-dev` are **excluded**, matching `project ci`. Pass `--include-dev-dependencies` to include them.

## Command options

| Option | Description | Default |
|---|---|---|
| `[path]` | Shopware project directory | Nearest project / working directory |
| `--format` | SBOM format (`cyclonedx-json` only) | `cyclonedx-json` |
| `--output` / `-o` | Output file path | `sbom.cdx.json` in the project root |
| `--include-dev-dependencies` | Include `packages-dev` from `composer.lock` | `false` |

## Relation to `project ci`

`shopware-cli project ci` also writes an SBOM as part of the production build. Prefer `project sbom` when you only need the bill of materials (for scanners, audits, or release packaging) and do not want to run asset compilation or other CI steps.

See also [Build a Complete Project](build.md).

## Requirements

- A valid `composer.lock` in the project root (or the given path)
- Shopware CLI with the `project sbom` command (from the release that introduced it)
