<?php

class SampleHandler {
  public static function handleRequest($sourceId) {
    $source = __DIR__ . '/../' . $sourceId . '/sample.json';
    $sampleData = json_decode(@file_get_contents($source));
    return $sampleData;
  }
}
