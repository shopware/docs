---
nav:
  title: Automatic refactoring
  position: 5002

---

# Automatic refactoring

Shopware CLI includes a built-in automatic refactoring tool that helps you automatically update and clean up code in your Shopware projects and extensions. It can refactor:

- PHP, using [Rector](https://getrector.org/)
- JavaScript, using [ESLint](https://eslint.org/)
- Admin Twig templates, using custom Shopware rules

Use this tool to modernize your codebase when upgrading to a new Shopware version or to apply best-practice changes automatically.

## Refactoring an extension

::: warning
Before you start, make sure you work on a copy or Git-versioned branch, because this command will modify your files in place!
:::

<Tabs>

<Tab title="With Docker (recommended)">

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension fix /ext
```

</Tab>

<Tab title="Without Docker">

```shell
shopware-cli extension fix /path/to/your/extension
```

</Tab>

</Tabs>

## Refactoring an entire project

You can also refactor a full Shopware project instead of a single extension.

<Tabs>

<Tab title="With Docker (recommended)">

```shell
docker run --rm -v "$(pwd)":/project ghcr.io/shopware/shopware-cli project fix /project
```

</Tab>

<Tab title="Without Docker">

```shell
shopware-cli project fix /path/to/your/project
```

</Tab>

</Tabs>

The CLI runs Rector and ESLint automatically. After completion, review all changes and commit or revert them as needed.

Make sure the `shopware/core` requirement in your `composer.json` file reflects the version you're targeting. Shopware CLI determines which upgrade rules to apply based on that version constraint.

## Experimental Twig upgrade using Large Language Models (LLMs)

Shopware CLI also includes an experimental AI-powered Twig upgrade tool. It can help migrate Twig templates between Shopware versions by using Large Language Models (LLMs) to propose code adjustments.

Because it's experimental, only run this feature on version-controlled (in Git or similar) code. It may generate changes that need manual review.

Run the upgrade:

<Tabs>

<Tab title="With Docker (recommended)">

```shell
docker run --rm -v $(pwd):/ext ghcr.io/shopware/shopware-cli extension ai twig-upgrade /ext 6.6.0.0 6.7.0.0-rc1 --provider gemini --model gemini-2.5-pro
```

</Tab>

<Tab title="Without Docker">

```shell
shopware-cli extension ai twig-upgrade /ext 6.6.0.0 6.7.0.0-rc1 --provider gemini --model gemini-2.5-pro
```

</Tab>

</Tabs>

### Supported providers

The Twig upgrade tool currently supports multiple providers:

| Provider     | Description                                            | Required environment variable |
|--------------|--------------------------------------------------------|-------------------------------|
| `gemini`     | [Google Gemini](https://ai.google.dev/) LLM            | `GEMINI_API_KEY`              |
| `openrouter` | [OpenRouter API](https://openrouter.ai/)               | `OPENROUTER_API_KEY`          |
| `ollama`     | Local [Ollama](https://ollama.com/) instance           | `OLLAMA_HOST` (optional)      |

Recommendations:

- For the most accurate Twig upgrades, use Google Gemini 2.5 Pro (`--provider gemini --model gemini-2.5-pro`).
- If you prefer a fully local setup, use Ollama, but ensure you have pulled a compatible model (e.g., `ollama pull llama3`).

## After running refactoring

Use Git or your diff tool to review the changes.

Test your extension or project thoroughly.

Commit the accepted changes and discard any unwanted ones.

You can combine automatic refactoring with other Shopware CLI commands (e.g., `project build` or `extension validate`) as part of your upgrade workflow.
