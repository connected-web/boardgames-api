<?php
header('Content-Type: application/json');

if (!isset($_SERVER['HTTPS'])) {
  $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  header("Location: $url");
  exit('{"moved": "Redirecting to secure endpoint.", "location": "' . $url .'", "status": "302"}');
}

$requestUri = $_SERVER['REQUEST_URI'];
$path = join(array_filter(explode('/', $requestUri)), '/');
$schema = endsWith($path, 'schema');
$path = str_replace('api', '', $path);
$path = $path ? $path : '/';

$endpointsData = json_decode(@file_get_contents('endpoints.json'))->endpoints;

$endpoints = array();
foreach ($endpointsData as $key=>$value) {
  $pathKey = $key['path'];
  $endpoints[$pathKey] = array('data' => $value);
}
$endpoints['/']['source'] = 'endpoints.json';
$endpoints['/schema']['source'] = 'schemas/endpoints-schema.json';

if ($endpoints[$path] && $endpoints[$path]['source']) {
  $source = $endpoints[$path]['source'];
  $sourceData = json_decode(@file_get_contents($source));
  exit(json_encode($sourceData));
} else {
  header("HTTP/1.0 404 Not Found");
  exit('{"message":"Resource not found", "status":"404", "path":"' . $path . '"}');
}

function endsWith($haystack, $needle) {
    $length = strlen($needle);
    if ($length == 0) {
        return true;
    }
    return (substr($haystack, -$length) === $needle);
}
