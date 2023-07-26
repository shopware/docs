#! /usr/bin/env bash

git clone --depth 1 https://github.com/shopware/platform.git

# delete dirs
rm -r ./resources/references/adr
rm -r ./resources/guidelines/testing/platform
rm -r ./.gitbook/assets/adr

# copy contents
cp -r ./platform/adr ./resources/references
cp -r ./platform/coding-guidelines/core ./resources/guidelines/testing/platform

rm -rf ./platform

deno run --allow-read --allow-write ./.github/scripts/update-summary.ts adr
deno run --allow-read --allow-write ./.github/scripts/update-summary.ts guidelines

deno run --allow-read --allow-write ./.github/scripts/format-adrs.ts adr
deno run --allow-read --allow-write ./.github/scripts/format-adrs.ts guidelines

mkdir -p ./.gitbook/assets/adr
mv ./resources/references/adr/assets/* .gitbook/assets/adr/
find resources/references/adr -type f -name '*md' -not -name '_*' -exec sed -i 's#(\./assets#(../../../.gitbook/assets/adr#' {} \;

# remove once https://gitlab.shopware.com/shopware/6/product/platform/-/merge_requests/10463 is merged
find resources/references/adr -type f -name '*md' -not -name '_*' -exec sed -i 's#(\.\./assets#(../../../.gitbook/assets/adr#' {} \;

find resources/references/adr/ -type d -exec touch '{}'/README.md \;
find resources/guidelines/testing/platform/ -type d -exec touch '{}'/README.md \;
