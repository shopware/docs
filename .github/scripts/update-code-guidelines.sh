#! /usr/bin/env bash

git clone --depth 1 https://github.com/shopware/shopware.git

# delete dirs
rm -r ./resources/guidelines/code/core

# copy contents
cp -r ./shopware/coding-guidelines/core ./resources/guidelines/code/core
rm ./resources/guidelines/code/core/AGENTS.md

rm -rf ./shopware

deno run --allow-read --allow-write ./.github/scripts/update-code-guidelines-summary.ts
deno run --allow-read --allow-write ./.github/scripts/format-code-guidelines.ts

find resources/guidelines/code/core -type f -name '*md' -not -name '_*' -exec sed -i 's#(../../adr/#(../../../references/adr/#' {} \;

find resources/guidelines/code/ -type d -exec touch '{}'/README.md \;
