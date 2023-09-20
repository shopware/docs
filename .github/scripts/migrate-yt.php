<?php

// $ find . -name '*.md' -exec php ./.github/scripts/migrate-yt.php {} +

$files = $_SERVER['argv'];
array_shift($files);

function get_youtube_title($id)
{
    echo "Fetching ${id}\n";
    $url = "https://www.youtube.com/watch?v=" . $id;
    $html = file_get_contents($url);
    preg_match('/<title>([^<]*)<\/title>/', $html, $matches);
    return $matches[1];
}

$transformer = function ($content, &$matches = []) {
    $pattern = '/<PageRef page="https:\/\/www\.youtube\.com\/watch\?v=([^"]*)" title="" target="\_blank" \/>/';

    preg_match_all($pattern, $content, $matches);

    if (!$matches[0]) {
        return $content;
    }

    foreach ($matches[0] as $i => $partial) {
        $id = $matches[1][$i];
        $title = get_youtube_title($id);
        $content = str_replace($matches[0][$i], '<YoutubeRef video="' . $id . '" title="' . $title . '" target="_blank" />', $content);
    }

    return $content;
};

// test
$test = '<PageRef page="https://www.youtube.com/watch?v=Hasz1sWIN_w" title="" target="_blank" /><PageRef page="https://www.youtube.com/watch?v=FgTX3Q5iFNg" title="" target="_blank" />';
$expect = '<YoutubeRef video="Hasz1sWIN_w" title="Shopware Tutorial for Beginners 2022 | How to Use Shopware - YouTube" target="_blank" /><YoutubeRef video="FgTX3Q5iFNg" title="Release News: Rules, Flows &amp; more in Shopware 6.5 RC - YouTube" target="_blank" />';
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

    echo "Transforming ${file}\n";
    file_put_contents($file, $transformed);
}