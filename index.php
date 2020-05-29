<?php

/**
 * Secure Redirect
 * 
 * Detects and redirects HTTP connections to HTTPS
 * 
 * php version 7
 *
 * @category   Pages
 * @package    BoardgamesAPI
 * @subpackage Core
 * @author     John Beech <github@mkv25.net>
 * @license    https://choosealicense.com/licenses/isc/ ISC
 * @link       https://boardgames-api.calisaurus.net/
 */

if (!isset($_SERVER['HTTPS'])) {
    $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header("Location: $url");
    exit("Redirecting to secure endpoint: $url");
} else {
    $url = '/docs/';
    header("Location: $url");
    exit(
        join(
            '\n', array(
            '<!DOCTYPE html>',
            '<html>',
            '<head><title>Redirecting to Board Game API /docs/</title></head>',
            '<body><script type="text/javascript">window.location = "' 
              . $url . '"</script></body>',
            '</html>')
        )
    );
}
