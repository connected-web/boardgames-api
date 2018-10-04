$.getJSON('/api/', function(data) {
    data.endpoints = data.endpoints || []

    const apiEndpoints = data.endpoints.filter(e => e.schema && e.sample)
    const schemaEndpoints = data.endpoints.filter(e => !e.sample && !e.path.includes('/sample'))
    const sampleEndpoints = data.endpoints.filter(e => e.path.includes('/sample'))

    $content = $('<content/>')

    $content.append('<heading>API Endpoints</heading>')
    $.each(apiEndpoints, renderEndpoint)

    $content.append('<heading>Samples</heading>')
    $.each(sampleEndpoints, renderEndpoint)

    $content.append('<heading>Schemas</heading>')
    $.each(schemaEndpoints, renderEndpoint)

    $('content:first-of-type').append($content)

    function renderEndpoint(key, endpoint) {
      let $endpoint = $('<endpoint/>')
      let $sample = $('<code class="json sample" />')
      let $schema = $('<code class="json schema" />')

      $endpoint.append($('<heading><a href="' + endpoint.path + '">' + endpoint.method + ' ' + endpoint.path + '</a></heading>'))
      $endpoint.append($('<p>' + endpoint.description + '</p>'))
      $endpoint.append($('<p>Accepts: ' + endpoint.accepts + '</p>'))

      if (endpoint.sample) {
        $endpoint.append($('<p>Sample: <a href="' + endpoint.sample + '">' + endpoint.sample + '</a></p>'))
        $endpoint.append($sample)
        $endpoint.append($('<p>Schema: <a href="' + endpoint.schema + '">' + endpoint.schema + '</a></p>'))
        $endpoint.append($schema)
      }
      $content.append($endpoint)

      $.getJSON(endpoint.sample, (data) => {
        $sample.html(JSON.stringify(data, null, 2))
      })

      $.getJSON(endpoint.schema, (data) => {
        $schema.html(JSON.stringify(data, null, 2))
      })
    }
})
