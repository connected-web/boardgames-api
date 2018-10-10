<?php
header('Content-Type: application/json');

if (!isset($_SERVER['HTTPS'])) {
  $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  header("Location: $url");
  exit('{"moved": "Redirecting to secure endpoint.", "location": "' . $url .'", "status": "302"}');
}

function registerEndpoints($endpointsData) {
  $endpoints = array();
  foreach ($endpointsData as $key => $value) {
    $pathKey = $value->path;
    $endpoints[$pathKey] = array('data' => $value);
  }
  return $endpoints;
}

function defineEndpoint($path, $endpointIndex) {
  $structure = array(
    "path" => $path,
    "method" => "GET",
    "description" => "",
    "accepts" => "application/json"
  );

  if (endsWith($path, "schema")) {
    $referencePath = str_replace("/schema", "", $path);
    $structure["description"] = "Returns a JSON schema which can be used to verify $referencePath, and $referencePath/sample";
    $structure["schema"] = "https://json-schema.org/draft-07/schema";
  } else if(endsWith($path, "sample")) {
    $referencePath = str_replace("/schema", "", $path);
    $structure["description"] = "Returns sample data representative of $referencePath";
    $structure["schema"] = str_replace("/sample", "/schema", $path);
  }

  return $structure;
}

function generateEndpointResponse($requestUri, $endpointIndex, $path) {
  $result = array('endpoints' => array());
  foreach ($endpointIndex as $path => $entry) {
    $data = $entry['data'] ? $entry['data'] : defineEndpoint($path, $endpointIndex);
    $result['endpoints'][] = $data;
  }
  return $result;
}

function render() {
  $requestUri = $_SERVER['REQUEST_URI'];
  $path = '/' . join(array_filter(explode('/', $requestUri)), '/');
  $schema = endsWith($path, 'schema');
  $path = $path ? $path : '/api/';
  $path = $path === '/api' ? '/api/' : $path;

  $endpointsData = json_decode(@file_get_contents('endpoints.json'))->endpoints;
  $endpoints = registerEndpoints($endpointsData);

  $endpoints['/api/']['source'] = 'generateEndpointResponse';
  $endpoints['/api/schema']['source'] = 'schemas/endpoints-schema.json';
  $endpoints['/api/sample']['source'] = 'samples/endpoints-sample.json';
  $endpoints['/api/boardgame/feed']['source'] = '../data/boardgame-feed.json';
  $endpoints['/api/boardgame/feed/sample']['source'] = 'samples/boardgame-feed-sample.json';
  $endpoints['/api/boardgame/feed/schema']['source'] = 'schemas/boardgame-feed-schema.json';
  $endpoints['/api/boardgame/stats']['source'] = '../data/boardgame-summaries.json';
  $endpoints['/api/boardgame/stats/sample']['source'] = 'samples/boardgame-stats-sample.json';
  $endpoints['/api/boardgame/stats/schema']['source'] = 'schemas/boardgame-stats-schema.json';

  if ($endpoints[$path] && $endpoints[$path]['source']) {
    $source = $endpoints[$path]['source'];
    if (function_exists($source)) {
      $body = call_user_func($source, $requestUri, $endpoints, $path);
      exit(json_encode($body));
    } else {
      $sourceData = json_decode(@file_get_contents($source));
      exit(json_encode($sourceData));
    }
  } else {
    header("HTTP/1.0 404 Not Found");
    exit('{"message":"Resource not found", "status":"404", "path":"' . $path . '"}');
  }
}

function startsWith($haystack, $needle) {
  $length = strlen($needle);
  return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle) {
  $length = strlen($needle);
  if ($length == 0) {
    return true;
  }
  return (substr($haystack, -$length) === $needle);
}

render();
