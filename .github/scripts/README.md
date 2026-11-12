# Repository scripts

This directory contains maintenance and automation scripts used by the Shopware Developer Documentation repository.

## Generate SEO metadata

The `seo:metadata` command sends selected, Git-tracked documentation articles to OpenAI and writes generated metadata to the frontmatter:

```yaml
nav:
  title: Generated navigation title
meta:
  description: Generated page description
```

### Setup

Create a repository-root `.env` file containing your OpenAI API key. The script loads this file automatically, while existing shell environment variables take precedence.

```dotenv
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-6-astra
```

The `.env` file is ignored by Git and must not be committed.

### Usage

Choose at least one field and provide one or more article files or directories:

```bash
pnpm seo:metadata -- --title --description guides/plugins/plugins/plugin-base-guide.md
```

Preview the generated changes without writing files:

```bash
pnpm seo:metadata -- --title --description --dry-run guides/plugins
```

Backfill only missing or empty selected fields:

```bash
pnpm seo:metadata -- --title --description --patch guides/plugins
```

Use `--all` instead of paths to process every eligible tracked article. Synchronized ADR and core coding-guideline content is always excluded.

### Approval and cost reporting

Before any external request, the command lists every article that would be transmitted and asks for approval. It then requests exact input-token counts, displays the estimated token and dollar range, and asks again before generation.

After generation, it reports observed input, cached, cache-write, output, reasoning, and total tokens together with the calculated API cost. Use `--yes` only for intentional non-interactive runs; it bypasses both prompts but still prints both preflight reports.

Pricing is read from [`openai-pricing.json`](openai-pricing.json). A model must have a pricing entry before it can be used.

Run `pnpm seo:metadata -- --help` for the complete option list.
