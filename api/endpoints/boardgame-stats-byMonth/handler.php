<?php

class Handler {
  public static function handleRequest($requestUri, $path, $matches=false) {
    $result = array('byMonth' => array());

    $result['requestUri'] = $requestUri;
    $result['path'] = $path;

    return $result;
  }
}
