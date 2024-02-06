# Shopware developer docs

[![Build and deploy](https://github.com/shopware/docs/actions/workflows/deploy-developer-portal.yml/badge.svg)](https://github.com/shopware/docs/actions/workflows/deploy-developer-portal.yml)
[![Issues](https://img.shields.io/github/issues/shopware/docs)](https://github.com/shopware/docs/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/shopware/docs)](https://github.com/shopware/docs/pull-requests)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fdeveloper.shopware.com)](https://developer.shopware.com)

## This repository

- provides general **developer** documentation for shopware 6
- is one of the sources for our [developer portal](https://github.com/shopware/developer-portal)
- represents the content of https://developer.shopware.com/docs/


![Developer docs](./assets/developer-docs.png)


## Workflows

They are defined in the [`.github/workflows`](./.github/workflows) folder and help the DX team to maintain the documentation. The workflows are triggered by events like `push`, `pull_request`, `schedule` and `workflow_dispatch`. The workflows are used to build, test, and deploy the documentation. If a PR pipeline fails, the PR will be marked as failed, and the PR will not be able to be merged. In this case, check the above-mentioned workflows to see what went wrong and where to fix it.

### Grammar and language

All changed content is checked with Reviewdog for grammar and language. The configuration for Reviewdog can be found in `.reviewdog.yml`. It will create warnings in the pull request if the language or grammar is not correct. A more in-depth explanation can be found in [Language and Grammar](./resources/guidelines/documentation-guidelines/03-language-and-grammar.md).

### Markdown

The markdown files are checked with [markdown-lint](https://github.com/avto-dev/markdown-lint). The configuration for markdown-lint can be found in
`markdown-style-config.yml`.

### Spellcheck

The markdown files are checked with [py-spelling](https://facelessuser.github.io/pyspelling/). The configuration for py-spelling can be found in `.spellcheck.yml`. To exclude a word from being spellchecked, add it to the `.wordlist.txt` file. Make sure to add the word at the right place, as the file is sorted alphabetically. You can use the following command to sort the file:

```bash
sort .wordlist.txt -o .wordlist.txt
```

### Media file formats

All files that are linked in markdown should be placed in the `assets` folder. The `assets` folder is used to store all images, videos, and other files that are linked in the markdown files. For more information, check [Methodize Assets](./resources/guidelines/documentation-guidelines/05-methodize-assets.md).

### Validate external links

Using [lychee](https://github.com/lycheeverse/lychee) to validate external links.


## Synced files

The [adr folder](./resources/references/adr) is in sync with the [shopware repository](https://github.com/shopware/shopware/tree/trunk/adr). 

The [assets adr folder](./assets/adr) is in sync with the [shopware repository](https://github.com/shopware/shopware/tree/trunk/adr/assets). 

The coding guidelines in [core](./resources/guidelines/code/core) are in sync with the [coding guideline](https://github.com/shopware/shopware/tree/trunk/coding-guidelines/core) from [shopware/shopware](https://github.com/shopware/shopware).

> Please create a PR in the [shopware](https://github.com/shopware/shopware/pulls) repository if you want to change something in the above folders.
