<?php

class Handler {
  public static function handleRequest($requestUri, $path, $matches=false, $endpoints=false) {
    $result = array(
      "name" => "boardgames-api",
      "version" => "1.0.0",
      "description" => "A browser for personalized boardgame data, sourced from boardgamesgeek.com and other locations.",
      "currentDate" => date(DateTime::ISO8601)
    );
    return $result;
  }
}
