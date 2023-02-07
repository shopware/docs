#! /usr/bin/env bash
set -e

# make proper line endings
#find . -name '*.md' -exec sed -ri 's/\r\n/\n/' {} +
#find . -name '*.md' -exec sed -ri 's/\n\r/\n/' {} +
#exit

# hints + typos
find . -name '*.md' -exec sed -i 's/{% hint style="info" %}/::: info/g' {} +
find . -name '*.md' -exec sed -i 's/{% hint style="info %}/::: info/g' {} +
find . -name '*.md' -exec sed -i 's/{% hint style=info %}/::: info/g' {} +
find . -name '*.md' -exec sed -i 's/{% hint type=info %}/::: info/g' {} +
find . -name '*.md' -exec sed -i 's/{% hint type="info" %}/::: info/g' {} +
find . -name '*.md' -exec sed -i 's/{% hint style="information" %}/::: info/g' {} +

find . -name '*.md' -exec sed -i 's/{% hint style="successful" %}/::: tip/g' {} +
find . -name '*.md' -exec sed -i 's/{% hint style="success" %}/::: tip/g' {} +
find . -name '*.md' -exec sed -i 's/{% hint style="warning" %}/::: warning/g' {} +
find . -name '*.md' -exec sed -i 's/{% hint style="danger" %}/::: danger/g' {} +

# replace manually
# find . -name '*.md' -exec sed -i 's/::: info /::: info\n/g' {} +

# pre-bugfix - plugins/plugins/storefront/add-data-to-storefront-page.md text->twig markup->yaml
find . -name 'add-data-to-storefront-page.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name 'add-data-to-storefront-page.md' -exec sed -i "s/\`\`\`markup---%%%---<!-- in Resources\/config\/services.xml -->/\`\`\`xml---%%%---\/\/ Resources\/config\/services.xml---%%%---<?xml version=\"1.0\" ?>/g" {} +
find . -name 'add-data-to-storefront-page.md' -exec sed -i "s/\`\`\`text---%%%---<!-- in Resources\/views\/storefront\/layout\/footer\/footer.html.twig -->/\`\`\`twig---%%%---\/\/ Resources\/views\/storefront\/layout\/footer\/footer.html.twig/g" {} +
find . -name 'add-data-to-storefront-page.md' -exec sed -i "s/---%%%---/\n/g" {} +

# end hint
find . -name '*.md' -exec sed -i 's/{% endhint %}/:::/g' {} +

# start hints at the new line
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%---\( *\):::/---%%%---:::/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# rename
find . -name 'README.md' -exec bash -c 'mv "$1" "${1/README/index}"' -- {} \;

# README page-ref
find . -name '*.md' -exec sed -i 's/{% page-ref page="\(.*\)README.md" %}/<PageRef page="\1" \/>/g' {} +

# anchored page-ref
find . -name '*.md' -exec sed -i 's/{% page-ref page="\(.*\).md#\([^"]*\)" %}/<PageRef page="\1#\2" \/>/g' {} +

# md page-ref
find . -name '*.md' -exec sed -i 's/{% page-ref page="\(.*\).md" %}/<PageRef page="\1" \/>/g' {} +

# captioned page-ref
find . -name '*.md' -exec sed -i 's/{% page-ref page="\([^"]*\)" caption="\([^"]*\)" %}/<PageRef page="\1" title="\2" \/>/g' {} +

# non-md page-ref
find . -name '*.md' -exec sed -i 's/{% page-ref page="\(.*\)" %}/<PageRef page="\1" \/>/g' {} +

# transform links
find . -name '*.md' -exec sed -i 's/](https:\/\/developer.shopware.com\/docs\//](\/docs\//g' {} +

# external embeds
find . -name '*.md' -exec sed -i 's/{% embed url="\(https:\/\/[^"]*\)\.md" caption="\([^"]*\)" %}/<PageRef page="\1" title="\2" target="_blank" \/>/g' {} +

# external embed - non-md
find . -name '*.md' -exec sed -i 's/{% embed url="\(https:\/\/[^"]*\)" caption="\([^"]*\)" %}/<PageRef page="\1" title="\2" target="_blank" \/>/g' {} +
find . -name '*.md' -exec sed -i 's/{% embed url="\(http:\/\/[^"]*\)" caption="\([^"]*\)" %}/<PageRef page="\1" title="\2" target="_blank" \/>/g' {} +

# external embeds - empty caption
find . -name '*.md' -exec sed -i 's/{% embed url="\(https:\/\/[^"]*\)\.md" caption="" %}/<PageRef page="\1" title="" target="_blank" \/>/g' {} +

# <!-- markdown-link-check-disable-next-line -->
find . -name '*.md' -exec sed -i 's/<!-- markdown-link-check-disable-next-line -->//g' {} +

# <!-- markdown-link-check-disable --> + <!-- markdown-link-check-enable -->

# tabs - T00D00 - is newline really needed?
find . -name '*.md' -exec sed -i 's/{% tabs %}/\n<Tabs>/g' {} +
find . -name '*.md' -exec sed -i 's/{% tab title="\(.*\)" %}/<Tab title="\1">/g' {} +

# end tabs
find . -name '*.md' -exec sed -i 's/{% endtab %}/<\/Tab>/g' {} +
find . -name '*.md' -exec sed -i 's/{% endtabs %}/<\/Tabs>/g' {} +

# zero width space
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/```\([a-zA-Z]*\)\xe2\x80\x8b---%%%---/```\1---%%%---/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# vcl to txt
# dotenv to txt
# http request to txt
# yml to yaml
# Yaml to yaml
# HTML to html
find . -name '*.md' -exec sed -i 's/```vcl/```txt/g' {} +
find . -name '*.md' -exec sed -i 's/```dotenv/```txt/g' {} +
find . -name '*.md' -exec sed -i 's/```http request/```txt/g' {} +
find . -name '*.md' -exec sed -i 's/```yml/```yaml/g' {} +
find . -name '*.md' -exec sed -i 's/```Yaml/```yaml/g' {} +
find . -name '*.md' -exec sed -i 's/```HTML/```html/g' {} +

# xml - replace newlines, replace xml-only, make newlines
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i "s/\`\`\`markup---%%%---<?xml/\`\`\`xml---%%%---<?xml/g" {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# xml2 - with // comment
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i "s/\`\`\`markup---%%%---\/\//\`\`\`xml---%%%---\/\//g" {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# html - replace newlines, replace html-only, make newlines
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i "s/\`\`\`markup---%%%---/\`\`\`html---%%%---/g" {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# javascript to json
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/```javascript---%%%---{/```json---%%%---{/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# dockerfile to txt
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/```dockerfile---%%%---/```txt---%%%---/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# bugfix ``json
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%---``json/---%%%---```json/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# update text to twig
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/```text---%%%---{% raw %}/```twig---%%%---{% raw %}/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# fix automatically generated docs
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/        {% raw %}---%%%---        ```twig/        ```twig/g' {} +
find . -name '*.md' -exec sed -i 's/        ```---%%%---        {% endraw %}/        ```---%%%---/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# bugfix twig and xml
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%---{% raw %}---%%%------%%%---```php/```twig---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%---{% raw %}---%%%------%%%---```markup/```twig---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%---{% raw %}---%%%------%%%---```text/```twig---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%---{% raw %}---%%%------%%%---```html/```twig---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\).xml" %}---%%%------%%%---```markup/```xml---%%%---\/\/ \1.xml/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# raw & endraw twig (outside)
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%---{% raw %}---%%%------%%%---```twig/```twig---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% raw %}---%%%------%%%---```/---%%%------%%%---```/g' {} +
find . -name '*.md' -exec sed -i 's/```---%%%------%%%---{% endraw %}/```---%%%------%%%---/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# bugfix automatically generated reference
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/```---%%%---{% endraw %}/```---%%%---/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# code - php, javascript, yaml, xml, html, css
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```php/```php---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```txt/```txt---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```javascript/```javascript---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```yaml/```yaml---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```Yaml/```yaml---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```xml/```xml---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%---```xml/```xml---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```css/```css---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```html/```html---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```dotenv/```dotenv---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```text/```text---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```bash/```bash---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```sh/```sh---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```nix/```nix---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```shell script/```shell script---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```jsx/```jsx---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%------%%%---```js/```js---%%%---\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# extra single-line xml
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\)" %}---%%%---```xml/```xml\/\/ \1/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# extra twig
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/{% code title="\([^"]*\).twig" %}---%%%------%%%---```markup/```twig---%%%---\/\/ \1.twig/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# solve {% raw %} - twig, text, html, php
# solve {% endraw %}

# text to txt
find . -name '*.md' -exec sed -i 's/{```text/```txt/g' {} +

# start code
find . -name '*.md' -exec sed -i 's/{% code %}//g' {} +

# endcode
find . -name '*.md' -exec sed -i 's/{% endcode %}//g' {} +

# add new line to the end of the file
find . -name '*.md' -exec sed -i -e '$a\' {} +
find . -name '*.md' -exec sed -i -e '$a\' {} +

# Fenced code blocks should be surrounded by blank lines
#find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%---```\([a-zA-Z]+\)/---%%%------%%%---```\1/g' {} +
#find . -name '*.md' -exec sed -i 's/```---%%%------%%%---/```---%%%------%%%------%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%------%%%------%%%---/---%%%------%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%------%%%------%%%------%%%---```---%%%---/---%%%---```---%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%------%%%------%%%---```---%%%---/---%%%---```---%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%------%%%---```---%%%---/---%%%---```---%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%------%%%---```---%%%---/---%%%---```---%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%------%%%---```---%%%---/---%%%---```---%%%---/g' {} +
#find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# fix blank lines
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%---```\([a-zA-Z]*\)/---%%%------%%%---```\1/g' {} +
#find . -name '*.md' -exec sed -i 's/```---%%%------%%%---/```---%%%------%%%------%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%------%%%------%%%---/---%%%------%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%------%%%------%%%------%%%---```---%%%---/---%%%---```---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%------%%%------%%%---```/---%%%------%%%---```/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%------%%%------%%%---```---%%%---/---%%%---```---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%------%%%---```---%%%---/---%%%---```---%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%------%%%---```---%%%---/---%%%---```---%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's_---%%%------%%%------%%%------%%%---_---%%%------%%%---_g' {} +
#find . -name '*.md' -exec sed -i 's_---%%%------%%%------%%%---_---%%%------%%%---_g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%------%%%---```---%%%---/---%%%---```---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%---$//g' {} +
find . -name '*.md' -exec sed -i 's/---%%%------%%%---```$/---%%%---```/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# four and three newlines
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%------%%%------%%%------%%%---/---%%%------%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%------%%%------%%%---/---%%%------%%%---/g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# remove multiple empty lines from the end
find . -name '*.md' -exec sed -i ':a;N;$!ba;s/\n/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%------%%%------%%%---$/---%%%---/g' {} +
find . -name '*.md' -exec sed -i 's/---%%%------%%%---$/---%%%---/g' {} +
#find . -name '*.md' -exec sed -i 's/---%%%---$//g' {} +
find . -name '*.md' -exec sed -i "s/---%%%---/\n/g" {} +

# force single new line
find . -name '*.md' -exec sed -i -e '$a\' {} +