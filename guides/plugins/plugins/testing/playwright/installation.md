---
nav:
  title: Installation
  position: 20

---

# Installation

Start by creating your own Playwright project.

```shell
npm init playwright@latest
```

Add the package for the Shopware Acceptance Test Suite to your project.

```shell
npm install @shopware-ag/acceptance-test-suite
```

Make sure to install Playwright and its dependencies.

```shell
npm install
npx playwright install
npx playwright install-deps
```
