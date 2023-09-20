#! /usr/bin/env bash
set -e

# ./.github/scripts/migrate-all.sh 78d89467e2fe8791aa912ddf27304268cc54fff2
# docker container rm --force docs-php
# git reset --hard && git checkout master && git branch -D next-test && git checkout -b next-test && docker container rm --force docs-php

add_and_commit () {
  echo "Checking git status"
  git status

  echo "Adding all to git"
  git add concepts/ guides/ products/ resources/ README.md SUMMARY.md

  echo "Committing - $1"
  git commit -m "$1"

  echo "New status"
  git status

  sleep 3s
}

# 1 - cherry pick scripts
#echo "Cherry-picking $1"
#git cherry-pick $1

# 2 - run default migrations
echo "Running migrate.sh (4x)"
./.github/scripts/migrate.sh
./.github/scripts/migrate.sh
./.github/scripts/migrate.sh
./.github/scripts/migrate.sh
add_and_commit "Automatic content migration"

# pre-3 - start docker container with PHP
docker run -dit -v "$PWD":/www/ --name docs-php php:8.0

# 3 - migrate youtube
echo "Running YoutubeRef migrations (PHP - migrate-yt)"
docker exec --workdir /www docs-php find . -name '*.md' -exec php ./.github/scripts/migrate-yt.php {} +
add_and_commit "Migrate YoutubeRef"

# 4 - migrate external
echo "Running external PageRef migrations (PHP - migrate-external.php)"
docker exec --workdir /www docs-php find . -name '*.md' -exec php ./.github/scripts/migrate-external.php {} +
add_and_commit "Migrate external PageRef"

# 5 - migrate links
echo "Running link migrations (PHP - migrate.php)"
docker exec --workdir /www docs-php find . -name '*.md' -exec php ./.github/scripts/migrate.php {} +
add_and_commit "Migrate markdown links"

# post-5 - remove container
docker container rm --force docs-php

# 6 - apply patch
echo "Applying patch"
git apply --reject --whitespace=fix --ignore-space-change --ignore-whitespace ./.github/scripts/patch.diff || true
#git apply --reject --whitespace=fix --ignore-space-change --ignore-whitespace ./.github/scripts/patch.diff || true
sleep 1s
rm ./**/**.rej ./.github/**/**.rej || true
add_and_commit "Apply patch"

# 7 - migrate frontmatter
echo "Running frontmatter migrations (deno)"
~/.deno/bin/deno run --allow-read --allow-write .github/scripts/migrate.js
add_and_commit "Migrate frontmatter"

# 8 - manual patches
echo "Cherry-picking - API"
git cherry-pick 419e7e66942a7ed3b22be0a389daa9832d2f04ac

echo "Finished, push!"
echo "git push --set-upstream origin next --force"
