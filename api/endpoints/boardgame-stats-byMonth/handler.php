<?php

class Handler {
  public static function handleRequest($requestUri, $path, $matches=false) {
    $result = array('byMonth' => array());
    $dateCode = $matches[1];

    $source = __DIR__ . '/../../../data/boardgame-summary-' . $dateCode  . '.json';
    $monthData = @json_decode(@file_get_contents($source));

    if ($monthData) {
      $result = $monthData;
    } else {
      header("HTTP/1.0 404 Not Found");
      exit('{"message":"Resource not found", "status":"404", "path":"' . $path . '"}');
    }

    return $result;
  }
}
