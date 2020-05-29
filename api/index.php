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
 * @license    https://choosealicense.com/no-permission/ UNLICENSED
 * @link       https://mvk25.net/dfma/
 */

require './functions/endsWith.php';
require './functions/registerEndpoints.php';
require './functions/startsWith.php';
require './functions/stringContains.php';
require './handlers/schema/handler.php';
require './handlers/sample/handler.php';

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

if (!isset($_SERVER['HTTPS'])) {
    $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header("Location: $url");
    exit(
        '{"moved": "Redirecting to secure endpoint.", "location": "' 
            . $url .'", "status": "302"}'
    );
}

/**
 * Sanitize a URL
 * 
 * @param string $string the url to sanitize
 * 
 * @return string
 */
function sanitizeUri($string)
{
    return preg_replace("/[^A-Za-z0-9\s\/:-]/", '', $string);
}

/**
 * Handler for a request URI
 * 
 * @param string $requestUri the url to find an endpoint for
 * @param string $path       the base path to substitute
 * @param array  $endpoints  the endpoints to search through  
 * 
 * @return mixed the endpoint object, or false if no matches found
 */
function findRequestHandler($requestUri, $path, $endpoints)
{
    $basePath = $path;
    $basePath = endsWith($basePath, '/schema') 
        ? str_replace('/schema', '', $basePath) : $basePath;
    $basePath = endsWith($basePath, '/sample') 
        ? str_replace('/sample', '', $basePath) : $basePath;

    foreach ($endpoints as $endpointKey => $endpoint) {
        $endpointRegex = isset($endpoint['data']->regex) 
            ? $endpoint['data']->regex : false;
        if ($endpointKey === $basePath 
            || $endpointRegex && @preg_match($endpointRegex, $path)
        ) {
            return $endpoint;
        }
    }

    return false;
}

/**
 * Helper method to include a handler file from the object
 * 
 * @param object $handler the handler object
 * 
 * @return mixed the result of the include operation
 */
function includeRequestHandler($handler)
{
    $sourceId = $handler['data']->sourceId;
    $handlerPath = './handlers/' . $sourceId . '/handler.php';
    return @include $handlerPath;
}

/**
 * Generate a response for a given handler; with fallbacks for 500 and 404 cases
 * 
 * @param object $handler    the handler object
 * @param string $requestUri the source request uri
 * @param string $path       the base path to substitute
 * @param array  $endpoints  the array of endpoints to search through
 * 
 * @return void calls exit() on one of three responses
 */
function generateResponse($handler, $requestUri, $path, $endpoints)
{
    if ($handler) {
        try {
            if (endsWith($path, '/schema')) {
                $response = SchemaHandler::handleRequest($handler['data']->sourceId);
            } elseif (endsWith($path, '/sample')) {
                $response = SampleHandler::handleRequest($handler['data']->sourceId);
            } else {
                $matches = array();
                includeRequestHandler($handler);
                if (isset($handler['data']->regex)) {
                    @preg_match($handler['data']->regex, $path, $matches);
                }
                $response = Handler::handleRequest(
                    $requestUri, $path, $matches, $endpoints
                );
            }
            exit(json_encode($response));
        } catch(Exception $ex) {
            header("HTTP/1.0 500 Server error");
            exit(
                '{"message":"Unable to process request", "status":"500", "path":"' 
                    . $path . '", "command": "' . $sourceId . '"}'
            );
        }
    } else {
        header("HTTP/1.0 404 Not Found");
        exit(
            '{"message":"Resource not found", "status":"404", "path":"' 
                . $path . '"}'
        );
    }
}

/**
 * Render the page by collecting request information and calling handlers
 * 
 * Inputs:
 * - $_SERVER['REQUEST_URI']
 * - endpoints.json
 * 
 * Side effects:
 * - registerEndpoints
 * - findRequestHandler
 * - generateResponse
 * 
 * @return void see generateResponse
 */
function render()
{
    $requestUri = sanitizeUri($_SERVER['REQUEST_URI']);

    $path = '/' . implode('/', array_filter(explode('/', $requestUri)));
    $schema = endsWith($path, 'schema');
    $path = $path ? $path : '/api/';
    $path = $path === '/api' ? '/api/' : $path;

    $endpointsData = json_decode(@file_get_contents('endpoints.json'))->endpoints;
    $endpoints = registerEndpoints($endpointsData);

    $handler = findRequestHandler($requestUri, $path, $endpoints);
    generateResponse($handler, $requestUri, $path, $endpoints);
}

render();
