<?php
if (!isset($_SERVER['HTTPS'])) {
  $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  header("Location: $url");
  exit("Redirecting to secure endpoint: $url");
}

$endpointData = json_decode(@file_get_contents('endpoints.json'));

header('Content-Type: application/json');

print json_encode($endpointData);
