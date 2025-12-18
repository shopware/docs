# AGENTS.md

This file provides guidance to coding agents like CursorAI or Claude Code.

## Repository Overview

This is the **Shopware Developer Documentation** repository (`shopware/docs`) that contains comprehensive developer documentation for Shopware 6, served at [developer.shopware.com/docs](https://developer.shopware.com/docs/). The documentation is integrated with the main [developer portal](https://github.com/shopware/developer-portal) repository.

:::info
> This documentation covers **Shopware 6** and is intended for use with the [shopware/shopware](https://github.com/shopware/shopware) open-source e-commerce framework.  
>  
> For contributing to or understanding Shopware core, see the [shopware/shopware GitHub repository](https://github.com/shopware/shopware) for source code and core platform issues.
:::

## Documentation Structure

The repository follows a 4-tier hierarchical organization:

- **`/concepts/`** - High-level architectural concepts (API, commerce, extensions, framework)
- **`/guides/`** - Step-by-step tutorials (hosting, installation, integrations, plugins)
- **`/products/`** - Product-specific documentation (CLI, PaaS, extensions, Digital Sales Rooms)
- **`/resources/`** - References, guidelines, ADRs, and tooling documentation

## Common Development Commands

### Documentation Development

```bash
# Setup developer portal environment
pnpm run docs:env

# Link documentation content to developer portal
pnpm run docs:link

# Preview documentation locally
pnpm run docs:preview
```

### Quality Control

```bash
# Run spellcheck via docker
make spellcheck-local

# Run spellcheck with installed sources (aspell and pyspelling)
make spellcheck

# Auto-fix markdown issues (be aware that it can only fix certain issues)
make fix

# Sort spellcheck wordlist
LC_ALL=C sort .wordlist.txt -o .wordlist.txt
```

## Key Architecture Patterns

### Dual Repository System

- **Content Repository**: `shopware/docs` (this repo) - contains all markdown content
- **Presentation Layer**: `shopware/developer-portal` - handles building and serving
- **Integration**: Content is linked via symlinks using `docs-cli.cjs`

### Automated Content Synchronization

Critical content auto-syncs from main `shopware/shopware` repository every 3 hours:

- `/adr/*.md` → `/resources/references/adr/*.md` (Architecture Decision Records)
- `/adr/assets/*` → `/assets/adr/*` (ADR assets)
- `/coding-guidelines/core` → `/resources/guidelines/code/core` (Coding standards)

### Extension Documentation Architecture

- **Apps**: Server-based external integrations with JWT validation, SDK integration
- **Plugins**: Internal Shopware core extensions with DAL, services, events
- **Themes**: Asset management, SCSS variables, inheritance system

## Quality Assurance Workflows

The repository has extensive automated quality control:

- **Markdown linting**: Validates formatting and style consistency
- **Spell checking**: Uses custom wordlist (`.wordlist.txt`) with pyspelling
- **Grammar checking**: Reviewdog integration for language validation
- **External link validation**: Lychee tool checks for broken links
- **Asset naming validation**: Enforces strict naming conventions
- **PageRef validation**: Custom Deno script checks internal cross-references

## Development Environment

- **Node.js**: 18.x with pnpm package manager
- **Nix**: Uses `devenv.nix` for consistent development environments
- **Build System**: VitePress managed through developer portal
- **CI/CD**: 11+ GitHub Actions workflows for quality control and synchronization

## File Conventions

### Markdown Style

- Configuration in `markdown-style-config.yml`
- 40+ linting rules enabled
- Consistent formatting enforced via CI/CD

### Asset Management

- All assets in `/assets/` directory
- Strict naming conventions enforced
- Images, diagrams, and media files (40,000+ characters worth)
- Extensive use of Mermaid diagrams, SVGs, and screenshots

### Code Snippets

- Reusable examples in `/snippets/` directory
- Multi-format support (PHP, JavaScript, Vue, Twig, XML, YAML, JSON)
- Configuration examples for apps, plugins, and system setup

## Cross-linking System

- Uses PageRef components for consistent internal linking
- Hierarchical navigation with clear parent-child relationships
- Context-aware references between Concepts ↔ Guides

## Version Management

- Branch-based versioning (`main`, `v6.5`, `v6.4`)
- Feature flag documentation for experimental features
- Clear deprecation notices and upgrade paths
- Automated format migration (Gitbook → VitePress)

## Redirects

`.gitbook.yaml` is used to manage redirects from old URLs to new ones, ensuring users find the correct content even after structural changes.

This can be done by the following prompt:

```shell
Check the current branch against main. There should be two files to be moved. Create a redirect in the `.gitbook.yaml` in the pattern that already exists.
```

## Do's and Don'ts for AI agents

### Do's

- **Follow repository conventions**: Adhere to the existing documentation structure, markdown style rules, and asset naming conventions as covered in the [documentation guidelines](https://developer.shopware.com/docs/resources/guidelines/documentation-guidelines/)
- **Maintain synced content**: When changes are needed in synced areas (`/resources/references/adr/`, `/assets/adr/`, `/resources/guidelines/code/core/`), propose edits against the `shopware/shopware` repository instead of changing them here.
- **Keep redirects consistent**: When pages are moved or removed, compare your branch against `main`, identify changed paths, and add redirects to `.gitbook.yaml` following the existing patterns.
- **Use quality checks when appropriate**: Run `make lint`, `make fix`, or the configured spellcheck tasks when you make non-trivial documentation changes, especially if CI feedback suggests issues.
- **Prefer incremental, focused changes**: Keep pull requests small and well-scoped so they are easy to review and reason about.

### Don't

- **Don't edit synced files directly**: Avoid modifying files that are automatically synchronized from `shopware/shopware`, as those changes will be overwritten.
- **Don't break existing URLs**: Avoid renaming or moving pages without adding a corresponding redirect entry in `.gitbook.yaml`.
- **Don't bypass style and spelling rules**: Do not introduce markdown formatting that conflicts with `markdown-style-config.yml`, or ignore repeated spelling issues that should be added to `.wordlist.txt`.
- **Don't change repository tooling lightly**: Avoid editing CI workflows, configuration files, or build tooling unless explicitly requested, and always keep changes minimal and well-documented.
- **Don't mix unrelated changes**: Do not bundle large, unrelated modifications (for example, structural moves plus extensive content rewrites) into a single change set.
