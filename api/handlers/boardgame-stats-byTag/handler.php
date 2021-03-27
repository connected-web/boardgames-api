<?php

class Handler {
  public static function handleRequest($requestUri, $path, $matches=false) {
    $result = array();
    $tag = $matches[1];
    $value = $matches[2];

    $source = __DIR__ . '/../../../data/tags/' . $tag  . '/' . $value .'.json';
    $gameStatsByTag = @json_decode(@file_get_contents($source));

    if ($gameStatsByTag) {
      $result = $gameStatsByTag;
    } else {
      header("HTTP/1.0 404 Not Found");
      exit('{"message":"Resource not found", "status":"404", "path":"' . $path . '"}');
    }

    return $result;
  }
}
