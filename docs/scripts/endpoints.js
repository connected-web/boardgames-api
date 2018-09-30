$.getJSON('/api/', function(data) {
    data.endpoints = data.endpoints || []
    $content = $('<content/>')
    $.each(data.endpoints, function(key, endpoint) {
      $endpoint = $('<endpoint/>')
      $endpoint.append($('<heading><a href="' + endpoint.path + '">' + endpoint.method + ' ' + endpoint.path + '</a></heading>'))
      $endpoint.append($('<p>' + endpoint.description + '</p>'))
      $endpoint.append($('<pre>Accepts: ' + endpoint.accepts + '</pre>'))
      $endpoint.append($('<p>Schema: <a href="' + endpoint.schema + '">' + endpoint.schema + '</a></p>'))
      $content.append($endpoint)
    })
    $('content:first-of-type').append($content)
})
