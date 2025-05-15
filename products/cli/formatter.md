---
nav:
  title: Formatter
  position: 5001

---

# Formatter

Shopware-CLI comes with an built-in formatter for PHP, JavaScript, CSS, SCSS and Admin Twig files.

To run the formatter, you can use the following command:

## Formatting a extension

<Tabs>

<Tab title="Without Docker">

```shell
shopware-cli extension format /path/to/your/extension
```

You can run it also in dry mode, just show the changes instead of editing the files

```shell
shopware-cli extension format /path/to/your/extension --dry-run
```

</Tab>

<Tab title="Docker">

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli extension format /ext
```

You can run it also in dry mode, just show the changes instead of editing the files

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli extension format /ext --dry-run
```

</Tab>

</Tabs>

## Formatting an entire project

<Tabs>

<Tab title="Without Docker">

```shell
shopware-cli project format /path/to/your/project
```

You can run it also in dry mode, just show the changes instead of editing the files

```shell
shopware-cli project format /path/to/your/project --dry-run
```

</Tab>

<Tab title="Docker">

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli project format /ext
```

You can run it also in dry mode, just show the changes instead of editing the files

```shell
docker run --rm -v $(pwd):/ext shopware/shopware-cli project format /ext --dry-run
```

</Tab>

</Tabs>

By default, the formatting is done by Shopware Coding Standard. You can configure the formatting by creating a `.php-cs-fixer.dist.php` in your extension root or a `.prettierrc` file for JavaScript, CSS and SCSS files.
