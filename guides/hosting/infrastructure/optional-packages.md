---
nav:
  title: Optional Packages
  position: 60
---

# Optional Packages

The minimal project template is intentionally small and does not include additional infrastructure integrations or developer tooling by default.

Extend a project with optional packages as needed.

## Symfony development tools

Install Symfony’s profiler and related development tools:

```bash
composer require --dev symfony/profiler-pack
```

## PaaS integration

Install the Platform-as-a-Service integration:

```bash
composer require shopware/paas-meta --ignore-platform-req=ext-amqp
```

## Fastly integration

Install Fastly support:

```bash
composer require fastly
```
