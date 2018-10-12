$.getJSON('/api/', function(data) {
    data.endpoints = data.endpoints || []

    const schemaEndpoints = data.endpoints.filter(e => e.path.includes('/schema'))

    $content = $('<content/>')

    $content.append('<heading>API Schemas</heading>')
    $.each(schemaEndpoints, renderEndpoint)

    $('content:first-of-type').append($content)

    function renderEndpoint(key, endpoint) {
      let $endpoint = $('<endpoint/>')
      let $sample = $('<code class="json sample" />')
      let $schema = $('<code class="json schema" />')

      $endpoint.append($('<heading><a href="' + endpoint.path + '">' + endpoint.method + ' ' + endpoint.path + '</a></heading>'))
      $endpoint.append($('<p>' + endpoint.description + '</p>'))
      $endpoint.append($('<p>Accepts: ' + endpoint.accepts + '</p>'))
      $content.append($endpoint)

      if (endpoint.path) {
        $.getJSON(endpoint.path, (data) => {
          $sample.html(JSON.stringify(data, null, 2))
        })
        $endpoint.append($('<p>Contents: <a href="' + endpoint.path + '">' + endpoint.path + '</a></p>'))
        $endpoint.append($sample)
      }

      if (endpoint.schema) {
        $.getJSON(endpoint.schema, (data) => {
          $schema.html(JSON.stringify(data, null, 2))
        })
        $endpoint.append($('<p>Schema: <a href="' + endpoint.schema + '">' + endpoint.schema + '</a></p>'))
        $endpoint.append($schema)
      }
    }

    registerExpandables()
})

function registerExpandables() {
  $('code.schema').addClass('expandable').on('click', (ev) => {
    $(ev.target).toggleClass('expanded')
  })
}
