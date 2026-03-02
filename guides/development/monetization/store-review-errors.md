---
nav:
  title: Store Review Errors
  position: 30

---

# Common Store Review Errors

These errors apply to all extensions submitted to the Shopware Store (plugins and apps).

## Composer and bootstrap issues

### Missing or invalid `composer.json`

Typical causes:

* `composer.json` missing.
* Technical name mismatch between Store and `composer.json`.
* Wrong `extra.shopware-plugin-class`.
* The extension archive has an incorrect ZIP structure.

Check:

* Store technical name matches the `composer.json` name.
* `extra.shopware-plugin-class` points to the correct bootstrap class.
* Namespace matches exactly (case-sensitive).
* Archive contains correct root folder structure.

Example [reference](https://github.com/FriendsOfShopware/FroshPlatformPerformance/blob/master/composer.json#L20):

**Correct**: `Swag\\MyPlugin\\SwagMyPlugin`
**Incorrect**: `Swag\\MyPlugin\\SwagMyPluginSW6`

[Extension Meta Information – Explanation of the properties](../../../../../guides/plugins/plugins/plugin-base-guide#the-composerjson-file)

### Missing bootstrap class

Common causes include:

* Wrong ZIP structure.
* A typo.
* Case-sensitive filename mismatch.
* Namespace mismatch.

### `composer.lock` Problems

Rules:

* `composer.lock` must NOT be included in the archive.
* Lock file must match `composer.json` before packaging.
* Run `composer update` if lock is outdated.

## Dependency and version errors

### Missing Shopware packages

An example error might look like `Class Shopware\Storefront\* not found`. To fix:

* Declare required packages correctly and explicitly in `composer.json`: e.g., `"require": {"shopware/frontend": "*"}`.
* Avoid "*" version constraints. Using "*" may resolve to Early Access (EA) versions, causing review failures.
* Use proper version ranges (e.g. `~6.1.0`).
* If needed, set `"minimum-stability": "RC"`.

This example shows the correct format:

```xml
<pre>"require": {

    "shopware/core": "~6.1.0",

    "shopware/storefront": "~6.1.0"

},

"minimum-stability": "RC"</pre>
```

### Class Not Found (EA Version Issue)

In the Shopware 6 Early Access (EA) version,`Class Shopware\Core\System\Snippet\Files\SnippetFileInterface` is not found and could not be autoloaded, causing the code review to fail.

**Cause**: Composer resolved an Early Access version due to wildcard constraints.

**Solution**: Pin versions and define minimum stability (see above).

## Code & Static Analysis Errors

### Forbidden Statements

Blocked:

* `die`
* `exit`
* `var_dump`

### Invalid method usage

You might see `Call to static method *jsonEncode() on an unknown class*`. Shopware always uses `json_encode()` exclusively - there is no other fallback.

### Remove dead code

Remove out-commented code from your source code. Ensure there are no unused classes or files.

## Cross-Domain Messaging

Ensure that cross-document messages are sent to the intended domain. Unrestricted messaging will be rejected.

Link: ["Cross-document messaging domains should be carefully restricted"](https://rules.sonarsource.com/javascript/RSPEC-2819)

## Cookie and security issues

Cookies must be set securely. All non-essential cookies must be registered in the Cookie Consent Manager.

## Packaging errors and unauthorized files and folders

Extensions submitted to the Shopware Store must not contain development files, temporary artifacts, or unused resources.

* ./tests
* .DS_Store
* .editorconfig
* .eslintrc.js
* .git
* .github
* .gitignore
* .gitkeep
* .gitlab-ci.yml
* .gitpod.Dockerfile
* .gitpod.yml
* .phar
* .php-cs-fixer.cache
* .php-cs-fixer.dist.php
* .php_cs.cache
* .php_cs.dist
* .prettierrc
* .stylelintrc
* .stylelintrc.js
* .sw-zip-blacklist
* .tar
* .tar.gz
* .travis.yml
* .zip
* .zipignore
* ISSUE_TEMPLATE.md
* Makefile
* Thumbs.db
* __MACOSX
* auth.json
* bitbucket-pipelines.yml
* build.sh
* composer.lock
* eslint.config.js
* grumphp.yml
* package-lock.json
* package.json
* phpdoc.dist.xml
* phpstan-baseline.neon
* phpstan.neon
* phpstan.neon.dist
* phpunit.sh
* phpunit.xml.dist
* phpunitx.xml
* psalm.xml
* rector.php
* shell.nix
* stylelint.config.js
* webpack.config.js
