<?php
if (!isset($_SERVER['HTTPS'])) {
  $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  header("Location: $url");
  exit("Redirecting to secure endpoint: $url");
}

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = join(array_filter(explode('/', $requestUri)), '/');

$templateHTML = @file_get_contents('./template.html');

$site = 'Boardgame API Docs';
$title = strip_tags('Home - ' . $requestPath);

$outputHTML = $templateHTML;
$outputHTML = str_replace('{{title}}', "$title - $site", $outputHTML);
$outputHTML = str_replace('{{navigation}}', '<p>Navigation</p>', $outputHTML);
$outputHTML = str_replace('{{body}}', '<p>Content</p>', $outputHTML);
$outputHTML = str_replace('{{footer}}', '<p>Footer</p>', $outputHTML);

print $outputHTML;
