<?php

/**
 * Documentation Index
 * 
 * Render out the documentation page using templates 
 * 
 * php version 7
 *
 * @category   Pages
 * @package    BoardgamesAPI
 * @subpackage Core
 * @author     John Beech <github@mkv25.net>
 * @license    https://choosealicense.com/licenses/isc/ ISC
 * @link       https://boardgames-api.calisaurus.net/
 */

if (!isset($_SERVER['HTTPS'])) {
    $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header("Location: $url");
    exit("Redirecting to secure endpoint: $url");
}

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = implode('/', array_filter(explode('/', $requestUri)));

$templateHTML = @file_get_contents('./template.html');

$site = 'Boardgame API Docs';

$pages = array();
$pages['docs'] = array(
  'title' => 'Home',
  'content' => './content/home.html'
);
$pages['docs/samples'] = array(
  'title' => 'Samples',
  'content' => './content/samples.html'
);
$pages['docs/schemas'] = array(
  'title' => 'Schemas',
  'content' => './content/schemas.html'
);

$page = $pages[$requestPath];
$page = $page ? $page : array(
  'title' => '404 Not found',
  'content' => './content/404.html'
);

$title = $page['title'];
$navigationHTML = @file_get_contents('./content/navigation.html');
$bodyContent = @file_get_contents($page['content']);
$breadCrumbs = '/' . $requestPath;

$outputHTML = $templateHTML;
$outputHTML = str_replace('{{body}}', $bodyContent, $outputHTML);
$outputHTML = str_replace('{{navigation}}', $navigationHTML, $outputHTML);
$outputHTML = str_replace(
    '{{footer}}', '<footer><heading>{{icon:shoe-prints}}' 
      . ' Footer</heading><p>The Board Game API is part of' 
      . ' <a href="https://calisaurus.net">{{icon:home}} calisaurus.net</a>' 
      . ' in support of <a href="https://boardgames.calisaurus.net">{{icon:dice}}' 
      . ' boardgames.calisaurus.net blog</a> and associated apps, and has been built'
      . ' in association with ' 
      . '<a href="https://github.com/connected-web/">{{icon:github:b}}' 
      . ' Connected Web</a>.</footer>', $outputHTML
);
$outputHTML = str_replace('{{title}}', "$title - $breadCrumbs - $site", $outputHTML);
$outputHTML = renderIconsAsHTML($outputHTML);

/**
 * Helper to render an icon as HTML
 * 
 * @param string $searchText the text containing the icon
 * 
 * @return string
 */
function renderIconsAsHTML($searchText)
{
    return str_replace(
        'fa ', 'fas ', preg_replace(
            '/({{icon:([a-z-]+):?([srlb])?}})/',
            '<i class="fa$3 fa-$2"></i>',
            $searchText
        )
    );
}

print $outputHTML;
