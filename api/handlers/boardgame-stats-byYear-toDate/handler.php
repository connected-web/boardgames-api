<?php

class Handler {
  public static function handleRequest($requestUri, $path, $matches=false) {
    $source = __DIR__ . '/../../../data/summaries/boardgame-summary-year-to-date.json';
    $yearToDateData = @json_decode(@file_get_contents($source));

    if ($yearToDateData) {
      $result = $yearToDateData;
    } else {
      header("HTTP/1.0 404 Not Found");
      exit('{"message":"Resource not found", "status":"404", "path":"' . $path . '"}');
    }

    return $result;
  }
}
