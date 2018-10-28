<?php

function registerEndpoints($endpointsData) {
  $endpoints = array();
  foreach ($endpointsData as $key => $value) {
    $pathKey = $value->path;
    $endpoints[$pathKey] = array('data' => $value);
  }
  return $endpoints;
}
