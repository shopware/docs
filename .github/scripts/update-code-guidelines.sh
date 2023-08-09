#! /usr/bin/env bash

git clone --depth 1 https://github.com/shopware/platform.git

# delete dirs
rm -r ./resources/guidelines/code/core

# copy contents
cp -r ./platform/coding-guidelines/core ./resources/guidelines/code/core

rm -rf ./platform

deno run --allow-read --allow-write ./.github/scripts/update-code-guidelines-summary.ts
deno run --allow-read --allow-write ./.github/scripts/format-code-guidelines.ts

find resources/guidelines/code/ -type d -exec touch '{}'/README.md \;
