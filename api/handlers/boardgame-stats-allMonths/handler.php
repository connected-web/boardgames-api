<?php

class Handler {
  public static function handleRequest($requestUri, $path, $matches=false) {
    $source = __DIR__ . '/../../../data/boardgame-summaries-all-months.json';
    $sourceData = file_get_contents($source);
    return $sourceData;
  }
}
