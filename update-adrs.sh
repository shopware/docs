#! /usr/bin/env bash

 git clone --depth 1 git@github.com:shopware/platform.git

rm -r ./adr
rm -r ./.gitbook/assets/adr
cp -r ./platform/adr ./
 rm -rf ./platform

deno run --allow-read --allow-write ./update-summary.ts

mkdir -p ./.gitbook/assets/adr
cp -r adr/assets/* .gitbook/assets/adr/ 
find adr -type f -name '*md' -not -name '_*' -exec sed -i 's#(\./assets#(../../.gitbook/assets/adr#' {} \;

find adr/ -type d -exec touch '{}'/README.md \;
