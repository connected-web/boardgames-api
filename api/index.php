<?php

require('./functions/endsWith.php');
require('./functions/registerEndpoints.php');
require('./functions/startsWith.php');
require('./functions/stringContains.php');
require('./handlers/schema/handler.php');
require('./handlers/sample/handler.php');

header('Content-Type: application/json');

if (!isset($_SERVER['HTTPS'])) {
  $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  header("Location: $url");
  exit('{"moved": "Redirecting to secure endpoint.", "location": "' . $url .'", "status": "302"}');
}

function sanitizeUri($string) {
  return preg_replace("/[^A-Za-z0-9\s\/:-]/", '', $string);
}

function findRequestHandler($requestUri, $path, $endpoints) {
  $basePath = $path;
  $basePath = endsWith($basePath, '/schema') ? str_replace('/schema', '', $basePath) : $basePath;
  $basePath = endsWith($basePath, '/sample') ? str_replace('/sample', '', $basePath) : $basePath;

  foreach ($endpoints as $endpointKey => $endpoint) {
    $endpointRegex = $endpoint['data']->regex;
    if ($endpointKey === $basePath || $endpointRegex && @preg_match($endpointRegex, $path)) {
      return $endpoint;
    }
  }

  return false;
}

function includeRequestHandler($handler) {
  $sourceId = $handler['data']->sourceId;
  $handlerPath = './handlers/' . $sourceId . '/handler.php';
  return @include($handlerPath);
}

function generateResponse($handler, $requestUri, $path, $endpoints) {
  if ($handler) {
    try {
      if (endsWith($path, '/schema')) {
        $response = SchemaHandler::handleRequest($handler['data']->sourceId);
      } elseif (endsWith($path, '/sample')) {
        $response = SampleHandler::handleRequest($handler['data']->sourceId);
      } else {
        includeRequestHandler($handler);
        if ($handler['data']->regex) {
          @preg_match($handler['data']->regex, $path, $matches);
        }
        $response = Handler::handleRequest($requestUri, $path, $matches, $endpoints);
      }
      exit(json_encode($response));
    } catch(Exception $ex) {
      header("HTTP/1.0 500 Server error");
      exit('{"message":"Unable to process request", "status":"500", "path":"' . $path . '", "command": "' . $sourceId . '"}');
    }
  } else {
    header("HTTP/1.0 404 Not Found");
    exit('{"message":"Resource not found", "status":"404", "path":"' . $path . '"}');
  }
}

function render() {
  $requestUri = sanitizeUri($_SERVER['REQUEST_URI']);

  $path = '/' . join(array_filter(explode('/', $requestUri)), '/');
  $schema = endsWith($path, 'schema');
  $path = $path ? $path : '/api/';
  $path = $path === '/api' ? '/api/' : $path;

  $endpointsData = json_decode(@file_get_contents('endpoints.json'))->endpoints;
  $endpoints = registerEndpoints($endpointsData);

  $handler = findRequestHandler($requestUri, $path, $endpoints);
  generateResponse($handler, $requestUri, $path, $endpoints);
}

render();
