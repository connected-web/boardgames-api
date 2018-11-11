<?php

class Handler {
  public static function handleRequest($requestUri, $path, $matches=false) {
    $result = array('game' => array());
    $boardGameApiId = $matches[1];

    $source = __DIR__ . '/../../../data/index/' . $boardGameApiId  . '.json';
    $gameData = @json_decode(@file_get_contents($source));

    if ($gameData) {
      $result['game'] = $gameData;
    } else {
      header("HTTP/1.0 404 Not Found");
      exit('{"message":"Game not found", "status":"404", "path":"' . $source . '"}');
    }

    return $result;
  }
}
