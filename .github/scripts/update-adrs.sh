#! /usr/bin/env bash

git clone --depth 1 -b 6.6.x https://github.com/shopware/shopware.git

rm -r ./resources/references/adr
rm -r ./assets/adr
cp -r ./shopware/adr ./resources/references
rm -rf ./shopware

#deno run --allow-read --allow-write ./.github/scripts/update-summary.ts || true
deno run --allow-read --allow-write ./.github/scripts/format-adrs.ts

mkdir -p ./assets/adr
mv ./resources/references/adr/assets/* assets/adr/
rm -r ./resources/references/adr/assets
find resources/references/adr -type f -name '*md' -not -name '_*' -exec sed -i 's#(\./assets#(../../../assets/adr#' {} \;

find resources/references/adr/ -type d -exec touch '{}'/index.md \;
