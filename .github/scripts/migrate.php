<?php

// sed does not support lookahead/lookbehind
// fallback to good old PHP :)
// $ find . -name '*.md' -exec php ./.github/scripts/migrate.php {} +

$files = $_SERVER['argv'];
array_shift($files);

$examples = [
    '[here](https://github.com/shopware/platform/blob/trunk/adr/workflow/2020-08-19-handling-feature-flags.md)' => '[here](https://github.com/shopware/platform/blob/trunk/adr/workflow/2020-08-19-handling-feature-flags.md)',
    '[here](http://github.com/shopware/platform/blob/trunk/adr/workflow/2020-08-19-handling-feature-flags.md)' => '[here](http://github.com/shopware/platform/blob/trunk/adr/workflow/2020-08-19-handling-feature-flags.md)',
    '[here](http/2020-08-19-handling-feature-flags)' => '[here](http/2020-08-19-handling-feature-flags)',
    '[here](https/2020-08-19-handling-feature-flags)' => '[here](https/2020-08-19-handling-feature-flags)',
    '[here](workflow/2020-08-19-handling-feature-flags)' => '[here](workflow/2020-08-19-handling-feature-flags)',
    '[here](./workflow/2020-08-19-handling-feature-flags)' => '[here](./workflow/2020-08-19-handling-feature-flags)',
    '[here](../workflow/2020-08-19-handling-feature-flags)' => '[here](../workflow/2020-08-19-handling-feature-flags)',
    '[here](../workflow/2020-08-19-handling-feature-flags#some)' => '[here](../workflow/2020-08-19-handling-feature-flags#some)',
    '[App base Guide](../../guides/plugins/apps/app-base-guide)' => '[App base Guide](../../guides/plugins/apps/app-base-guide)',
    '[Commerce](concepts/commerce/)' => '[Commerce](concepts/commerce/)',
    '[App base Guide](../../guides/plugins/apps/app-base-guide.html#test)' => '[App base Guide](../../guides/plugins/apps/app-base-guide.html#test)',
];

$transformer = function ($content) {
    // replace .md with empty string
    $content = preg_replace(
        '_\[([^\[]+)\]\((?!http:|https:)([^\)]*).md(#?[^\)]*)\)_',
        '[\\1](\\2\\3)',
        $content
    );
    // replace /README with /
    return preg_replace(
        '_\[([^\[]+)\]\((?!http:|https:)([^\)]*)/README(#?[^\)]*)\)_',
        '[\\1](\\2/\\3)',
        $content
    );
};

// test
foreach ($examples as $input => $output) {
    $transformed = $transformer($input);
    if ($output !== $transformed) {
        exit('Not okay: ' . $input . ' SHOULD BE ' . $output . ' IS ' . $transformed);
    }
}

// transform
foreach ($files as $file) {
    file_put_contents($file, $transformer(file_get_contents($file)));
}