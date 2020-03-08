<?php

class Handler {
  public static function handleRequest($requestUri, $path, $matches=false) {
    $source = __DIR__ . '/../../../data/boardgame-list.json';
    $sourceData = json_decode(@file_get_contents($source));
    return array('games' => $sourceData);
  }
}
