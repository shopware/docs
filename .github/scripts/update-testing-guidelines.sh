#! /usr/bin/env bash

git clone --depth 1 https://github.com/shopware/platform.git

rm -r ./resources/guidelines/testing
rm -r ./.gitbook/assets/adr
cp -r ./platform/unit-tests ./resources/guidelines/testing
rm -rf ./platform

deno run --allow-read --allow-write ./.github/scripts/update-summary.ts
deno run --allow-read --allow-write ./.github/scripts/format-testing-guidelines.ts

mkdir -p ./.gitbook/assets/adr
mv ./resources/guidelines/testing/unit-test* .gitbook/assets/adr/
find resources/guidelines/testing -type f -name '*md' -not -name '_*' -exec sed -i 's#(\./assets#(../../../.gitbook/assets/adr#' {} \;

# remove once https://gitlab.shopware.com/shopware/6/product/platform/-/merge_requests/10463 is merged
find resources/guidelines/testing -type f -name '*md' -not -name '_*' -exec sed -i 's#(\.\./assets#(../../../.gitbook/assets/adr#' {} \;

find resources/guidelines/testing -type d -exec touch '{}'/README.md \;
