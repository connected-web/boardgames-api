<?php
if (!isset($_SERVER['HTTPS'])) {
  $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  header("Location: $url");
  exit("Redirecting to secure endpoint: $url");
}
else {
  $url = '/docs/';
  header("Location: $url");
  exit(join(array(
    '<!DOCTYPE html>',
    '<html>',
    '<head><title>Redirecting to Board Game API /docs/</title></head>',
    '<body><script type="text/javascript">window.location = "' . $url . '"</script></body>',
    '</html>'), '\n'));
}
