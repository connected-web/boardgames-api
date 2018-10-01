<?php
if (!isset($_SERVER['HTTPS'])) {
  $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  header("Location: $url");
  exit("Redirecting to secure endpoint: $url");
}

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = join(array_filter(explode('/', $requestUri)), '/');

$templateHTML = @file_get_contents('./template.html');
$homeContent = @file_get_contents('./content/home.html');
$bodyContent = $homeContent;

$site = 'Boardgame API Docs';
$title = 'Home';
$breadCrumbs = '/' . $requestPath . '/';

$outputHTML = $templateHTML;
$outputHTML = str_replace('{{body}}', $bodyContent, $outputHTML);
$outputHTML = str_replace('{{navigation}}', '<nav><heading>{{icon:bars}} Navigation</heading><p>No where to navigate to yet.</p></nav>', $outputHTML);
$outputHTML = str_replace('{{footer}}', '<footer><heading>{{icon:shoe-prints}} Footer</heading><p>The Board Game API is part of <a href="https://calisaurus.net">{{icon:home}} calisaurus.net</a> in support of <a href="https://boardgames.calisaurus.net">{{icon:dice}} boardgames.calisaurus.net blog</a> and associated apps, and has been built in association with <a href="https://github.com/connected-web/">{{icon:github:b}} Connected Web</a>.</footer>', $outputHTML);
$outputHTML = str_replace('{{title}}', "$title - $breadCrumbs - $site", $outputHTML);
$outputHTML = renderIconsAsHTML($outputHTML);

function renderIconsAsHTML($searchText) {
  return str_replace('fa ', 'fas ', preg_replace(
      '/({{icon:([a-z-]+):?([srlb])?}})/',
      '<i class="fa$3 fa-$2"></i>',
      $searchText
  ));
}

print $outputHTML;
