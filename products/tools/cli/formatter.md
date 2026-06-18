---
nav:
  title: Formatter
  position: 5001

---

# Formatter

Shopware CLI includes a built-in code formatter for PHP, JavaScript, CSS, SCSS, and Admin Twig files. Use it to apply the Shopware [Coding Standard](https://developer.shopware.com/docs/resources/guidelines/code/) automatically and keep your project consistent. You can format individual extensions or entire projects.  

A `--dry-run` mode is also available to preview changes without modifying files.

The formatter runs PHP and Node.js tooling under the hood. The Docker examples are recommended because the image already contains the required runtime dependencies. If PHP and Node.js are available locally, you can run the `shopware-cli` commands directly instead.

## Formatting an extension

<Tabs>

<Tab title="With Docker (recommended)">

The command mounts your current directory to `/ext` inside the container and formats that mounted extension directory:

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension format /ext
```

Dry run (preview changes without editing files):

```shell
docker run --rm -v "$(pwd)":/ext ghcr.io/shopware/shopware-cli extension format /ext --dry-run
```

</Tab>

<Tab title="Without Docker">

Use the local path to your extension when running the command without Docker:

```shell
shopware-cli extension format /path/to/your/extension
```

Dry run (preview changes without editing files):

```shell
shopware-cli extension format /path/to/your/extension --dry-run
```

</Tab>

</Tabs>

## Formatting an entire project

<Tabs>

<Tab title="With Docker (recommended)">

The command mounts your current directory to `/project` inside the container and formats that mounted project directory:

```shell
docker run --rm -v "$(pwd)":/project ghcr.io/shopware/shopware-cli project format /project
```

Dry run (preview changes without editing files):

```shell
docker run --rm -v "$(pwd)":/project ghcr.io/shopware/shopware-cli project format /project --dry-run
```

</Tab>

<Tab title="Without Docker">

Use the local path to your project when running the command without Docker:

```shell
shopware-cli project format /path/to/your/project
```

Dry run (preview changes without editing files):

```shell
shopware-cli project format /path/to/your/project --dry-run
```

</Tab>

</Tabs>

## Configuration

By default, the formatting is done by Shopware Coding Standard. You can configure the formatting by creating a `.php-cs-fixer.dist.php` in your extension root or a `.prettierrc` file for JavaScript, CSS, and SCSS files.
