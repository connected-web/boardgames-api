<?php

class Handler {
  public static function handleRequest($requestUri, $path, $matches=false) {
    $source = __DIR__ . '/../../../data/summaries/boardgame-summary-month-to-date.json';
    $monthToDateData = @json_decode(@file_get_contents($source));

    if ($monthToDateData) {
      $result = $monthToDateData;
    } else {
      header("HTTP/1.0 404 Not Found");
      exit('{"message":"Resource not found", "status":"404", "path":"' . $path . '"}');
    }

    return $result;
  }
}
