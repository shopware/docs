---
nav:
  title: Shopware Extensions
  position: 80

---

# Shopware MCP Extensions

Shopware ships several MCP-related projects beyond the core platform. This page covers what each one does, who it is for, and how to get it.

## Shopware Copilot

Shopware Copilot is the AI assistant embedded directly in the Shopware Administration. It is the primary consumer of the MCP server; merchants can ask questions, get recommendations, and perform store management tasks through a conversational interface without leaving Admin.

Copilot connects to the shop's `/api/_mcp` endpoint under the hood. No extra configuration is needed to use Copilot: once the MCP server is enabled, Copilot automatically has access to the registered tools and can use them on behalf of the merchant.

## SwagMcpMerchantTools

**Repository:** [`shopware/SwagMcpMerchantTools`](https://github.com/shopware/SwagMcpMerchantTools)\
**Distribution:** Composer (`composer require swag/mcp-merchant-tools`)\
**Tool prefix:** `merchant-*`

A Shopware plugin that extends the MCP server with merchant-focused workflow tools. Where core tools are DAL primitives (search, read, upsert, delete), these are high-level workflows with human-readable parameters built for merchant operators.

:::warning Experimental
`SwagMcpMerchantTools` is an experimental proof of concept with no backward-compatibility guarantee. It may be removed at any time, likely in favor of [Shopware Copilot](#shopware-copilot).
:::

### Available tools

| Tool                         | What it does                                                                                               |
|------------------------------|------------------------------------------------------------------------------------------------------------|
| `merchant-order-summary`     | Formatted overview of an order including customer, line items, totals, and current state                   |
| `merchant-customer-lookup`   | Find a customer by email address, customer number, or UUID                                                 |
| `merchant-product-create`    | Create a product with natural parameters (gross price, tax rate, currency code) and resolve IDs internally |
| `merchant-revenue-report`    | Revenue breakdown for a date range, grouped by day, week, or month                                         |
| `merchant-bestseller-report` | Top products by quantity sold for a date range                                                             |
| `merchant-storefront-search` | Customer-facing product search with resolved prices and customer-specific pricing                          |
| `merchant-cart-manage`       | Create, inspect, and modify a cart                                                                         |
| `merchant-cart-checkout`     | Complete a cart checkout                                                                                   |
| `merchant-checkout-methods`  | List available payment and shipping methods for a sales channel                                            |

All writing tools default to `dryRun=true`.

## SwagMcpDevTools

**Repository:** [`shopware/SwagMcpDevTools`](https://github.com/shopware/SwagMcpDevTools)\
**Distribution:** Composer (`composer require swag/mcp-dev-tools`)\
**Tool prefix:** `swag-dev-tools-*`

A Symfony bundle (not a plugin) that adds developer diagnostic tools to the MCP server. It targets environments where host-side tools cannot reach the Shopware instance directly, such as SaaS environments, staging servers, and on-premises deployments.

:::warning Experimental
`SwagMcpDevTools` is an experimental proof of concept with no backward-compatibility guarantee and may be removed at any time.
:::

### Diagnostic tools

| Tool                        | What it does                                                                     |
|-----------------------------|----------------------------------------------------------------------------------|
| `swag-dev-tools-log-stream` | Read recent Monolog entries from disk, filtered by level and timestamp           |
| `swag-dev-tools-log-search` | Search log files for substring matches, with optional level and filename filters |

Access is read-only and controlled by MCP authentication and the per-integration allowlist. Sensitive fields (passwords, tokens, auth headers) are automatically redacted; values longer than 300 characters are truncated.

Install via one line in `config/bundles.php` after requiring the package, which is simpler than plugin lifecycle management.

## ai-coding-tools

**Repository:** [`shopwareLabs/ai-coding-tools`](https://github.com/shopwareLabs/ai-coding-tools)\
**Distribution:** Claude Code plugin marketplace (community project, MIT-licensed, experimental)

A separate project for **developer-facing** local MCP tools: code generation, testing, linting, cache clearing, and deployment operations. This is distinct from the shop's `/api/_mcp` endpoint.

Where `/api/_mcp` gives AI clients access to shop data and merchant operations, `ai-coding-tools` gives AI coding assistants in your IDE access to the Shopware development environment itself. Use this when you want an AI coding assistant in your IDE to run `bin/console`, execute tests, or generate boilerplate code against a local Shopware installation.

### Installation

`ai-coding-tools` is a [Claude Code plugin marketplace](https://docs.claude.com/en/docs/claude-code/plugins). With Claude Code installed, add the marketplace and install only the plugins you need:

```bash
/plugin marketplace add shopwareLabs/ai-coding-tools
/plugin install dev-tooling@shopware-ai-coding-tools
```

The marketplace bundles several plugins, for example `dev-tooling` (PHP/JS tooling via MCP), `gh-tooling` (GitHub CLI wrapper), `test-writing` (PHPUnit test generation), and `chunkhound-integration` (semantic code research). Selected skills are also exported as portable [Agent Skills](https://agentskills.io) packages for tools such as Cursor, Codex, and Gemini CLI. See the repository README for the full plugin list and setup steps.

:::warning Experimental
`ai-coding-tools` is an experimental community project, not an official Shopware product. Its plugins, skills, and commands can change or be removed at any time.
:::
