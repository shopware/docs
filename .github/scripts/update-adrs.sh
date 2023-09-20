#! /usr/bin/env bash

git clone --depth 1 https://github.com/shopware/platform.git

rm -r ./resources/references/adr
rm -r ./.gitbook/assets/adr
cp -r ./platform/adr ./resources/references
rm -rf ./platform

deno run --allow-read --allow-write ./.github/scripts/update-summary.ts
deno run --allow-read --allow-write ./.github/scripts/format-adrs.ts

mkdir -p ./.gitbook/assets/adr
mv ./resources/references/adr/assets/* .gitbook/assets/adr/
find resources/references/adr -type f -name '*md' -not -name '_*' -exec sed -i 's#(\./assets#(../../../.gitbook/assets/adr#' {} \;

# remove once https://gitlab.shopware.com/shopware/6/product/platform/-/merge_requests/10463 is merged
find resources/references/adr -type f -name '*md' -not -name '_*' -exec sed -i 's#(\.\./assets#(../../../.gitbook/assets/adr#' {} \;

find resources/references/adr/ -type d -exec touch '{}'/index.md \;
