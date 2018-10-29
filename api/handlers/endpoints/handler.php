<?php

class Handler {
  public static function defineEndpoint($path, $endpoints) {
    $structure = array(
      "path" => $path,
      "method" => "GET",
      "description" => "",
      "accepts" => "application/json"
    );

    if (endsWith($path, "schema")) {
      $referencePath = str_replace("/schema", "", $path);
      $structure["description"] = "Returns a JSON schema which can be used to verify $referencePath, and $referencePath/sample";
      $structure["schema"] = "https://json-schema.org/draft-07/schema";
    } else if(endsWith($path, "sample")) {
      $referencePath = str_replace("/schema", "", $path);
      $structure["description"] = "Returns sample data representative of $referencePath";
      $structure["schema"] = str_replace("/sample", "/schema", $path);
    }

    return $structure;
  }

  public static function handleRequest($requestUri, $path, $matches=false, $endpoints=false) {
    $endpoints = $endpoints ? $endpoints : array();
    $result = array('endpoints' => array());
    foreach ($endpoints as $path => $entry) {
      $data = $entry['data'] ? $entry['data'] : Handler::defineEndpoint($path, $endpoints);
      $result['endpoints'][] = $data;
    }
    return $result;
  }
}
