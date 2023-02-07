<?php

// $ find . -name '*.md' -exec php ./.github/scripts/migrate-external.php {} +

$files = $_SERVER['argv'];
array_shift($files);

function get_page_title($url)
{
    echo "Fetching ${url}\n";
    //$html = file_get_contents($url);

    $custom = [
        'https://github.com/shopware/production' => 'shopware/production @ GitHub',
        'https://getcomposer.org/doc/05-repositories.md\\#using-private-repositories' => 'Using private repositories @ getcomposer.org',
        'https://github.com/shopware/platform/blob/552675ba24284dec2bb01c2107bf45f86b362550/src/Administration/Resources/app/administration/src/module/sw-product/page/sw-product-detail/sw-product-detail.html.twig\\#L120' => 'shopware/platform - sw-product-detailhtml.twig @ GitHub',
        'https://github.com/goldbergyoni/javascript-testing-best-practices' => 'Javascript testing - best practices @ GitHub',
    ];
    if ($custom[$url]) {
        return $custom[$url];
    }

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $html = curl_exec($curl);

    if (!$html) {
        echo "ERROR!\n";
        return;
    }

    preg_match('/<title([^>]*)>([^<]*)<\/title>/', $html, $matches);

    return $matches[2] ?? null;
}

$transformer = function ($content, &$matches = []) {
    $pattern = '/<PageRef page="(http|https):\/\/([^"]*)" title="" target="\_blank" \/>/';

    preg_match_all($pattern, $content, $matches);

    if (!$matches[0]) {
        return $content;
    }

    foreach ($matches[0] as $i => $partial) {
        $url = $matches[1][$i] . '://' . $matches[2][$i];
        $title = get_page_title($url);

        if (!$title) {
            echo "\n\nNO TITLE " . $url . "\n\n";
            continue;
        }

        $search = $matches[0][$i];
        $replace = '<PageRef page="' . $url . '" title="' . $title . '" target="_blank" />';

        $content = str_replace($search, $replace, $content);
    }

    return $content;
};

// test
$test = '<PageRef page="https://www.cypress.io/blog/2019/05/02/run-cypress-with-a-single-docker-command" title="" target="_blank" />';
$expect = '<PageRef page="https://www.cypress.io/blog/2019/05/02/run-cypress-with-a-single-docker-command" title="Run Cypress with a single Docker command" target="_blank" />';
if (false && $expect !== ($transformed = $transformer($test))) {
    echo $transformed;
    throw new \Exception('Transformer mismatch');
}

// transform
foreach ($files as $file) {
    $content = file_get_contents($file);
    $matches = [];
    $transformed = $transformer($content, $matches);
    if ($content === $transformed) {
        continue;
    }
    
    file_put_contents($file, $transformed);
}