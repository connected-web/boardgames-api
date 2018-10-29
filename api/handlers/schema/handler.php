<?php

class SchemaHandler {
  public static function handleRequest($sourceId) {
    $source = __DIR__ . '/../' . $sourceId . '/schema.json';
    $schemaData = json_decode(@file_get_contents($source));
    return $schemaData;
  }
}
