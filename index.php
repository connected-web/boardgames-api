<?php
if (!isset($_SERVER['HTTPS'])) {
  $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  header("Location: $url");
  exit("Redirecting to secure endpoint: $url");
}
else {
  $url = '/docs';
  header("Location: $url");
  exit("Redirecting to docs endpoint: $url");
}
