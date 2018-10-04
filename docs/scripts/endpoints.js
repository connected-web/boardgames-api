$.getJSON('/api/', function(data) {
    data.endpoints = data.endpoints || []
    const endpoints = data.endpoints.filter(e => !e.path.includes('/schema'))
    const schemaEndpoints = data.endpoints.filter(e => e.path.includes('/schema'))
    $content = $('<content/>')
    $content.append('<heading>Endpoints</heading>')
    $.each(endpoints, renderEndpoint)
    $content.append('<heading>Schemas</heading>')
    $.each(schemaEndpoints, renderEndpoint)
    $('content:first-of-type').append($content)

    function renderEndpoint(key, endpoint) {
      $endpoint = $('<endpoint/>')
      $endpoint.append($('<heading><a href="' + endpoint.path + '">' + endpoint.method + ' ' + endpoint.path + '</a></heading>'))
      $endpoint.append($('<p>' + endpoint.description + '</p>'))
      $endpoint.append($('<pre>Accepts: ' + endpoint.accepts + '</pre>'))
      $endpoint.append($('<p>Schema: <a href="' + endpoint.schema + '">' + endpoint.schema + '</a></p>'))
      $content.append($endpoint)
    }
})
