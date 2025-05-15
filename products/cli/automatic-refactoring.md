---
nav:
  title: Automatic refactoring
  position: 5002

---

# Automatic refactoring

Shopware-CLI comes with a built-in automatic refactoring tool for PHP, JavaScript, and Admin Twig files.

It uses the tools:

- [Rector](https://getrector.org/) for PHP
- [ESLint](https://eslint.org/) for JavaScript
- Custom rules for Admin Twig files

## Refactoring an extension

::: warning
Make sure you have a copy of your extension before running the command, as it will change your files!
:::

<Tabs>

<Tab title="Without Docker">

```shell
shopware-cli extension fix /path/to/your/extension
```

</Tab>

<Tab title="Docker">

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli extension fix /ext
```

</Tab>

</Tabs>

## Refactoring an entire project

<Tabs>

<Tab title="Without Docker">

```shell
shopware-cli project fix /path/to/your/project
```

</Tab>

<Tab title="Docker">

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli project fix /project
```

</Tab>

</Tabs>

This will execute Rector and ESLint to refactor your code. You should review the changes made and decide whether you want to keep them or not.

Make sure that you have adjusted the `shopware/core` requirement in the `composer.json` file of your extension to the version you want to upgrade to. It will use the lowest supported version your Composer constraint is compatible with.

## Experimental Twig upgrade using Large Language Models

The Extension Verifier also includes an experimental feature to upgrade your Twig templates using Large Language Models (LLMs). This feature is experimental and should only be executed on code that is versioned in Git or similar.
To use this feature, you can run the following command:

<Tabs>

<Tab title="Without Docker">

```shell
shopware-cli extension ai twig-upgrade /ext 6.6.0.0 6.7.0.0-rc1 --provider gemini --model gemini-2.5-pro-exp-03-25
```

</Tab>

<Tab title="Docker">

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli extension ai twig-upgrade /ext 6.6.0.0 6.7.0.0-rc1 --provider gemini --model gemini-2.5-pro-exp-03-25
```

</Tab>

</Tabs>

Extension Verifier currently supports multiple providers:

- `gemini` - Google Gemini LLM (requires `GEMINI_API_KEY` environment variable)
- `openrouter` - OpenRouter API (requires `OPENROUTER_API_KEY` environment variable)
- `ollama` - Local Ollama (uses localhost by default, `OLLAMA_HOST` environment variable can be used to specify a different host)

Our recommendation is to use Google Gemini 2.5 Pro, as it provides the best results for the upgrade.
