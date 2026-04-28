#! /usr/bin/env bash
set -e

[[ -z "$1" ]] && echo "Missing working directory argument" && exit 1

echo "Migrating structure"
sh ./.github/scripts/migrate-multi-product.sh
