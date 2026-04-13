#! /usr/bin/env bash

git clone --depth 1 https://github.com/shopware/shopware.git

# delete dirs
rm -r ./resources/references/app-reference/script-reference

# copy contents
cp -r ./shopware/src/Core/DevOps/Resources/generated ./resources/references/app-reference/script-reference

# recover index
git checkout -- resources/references/app-reference/script-reference/index.md

# cleanup
rm -rf ./shopware
