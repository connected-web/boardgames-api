/* global $ */
$.getJSON('/api/endpoints', function (data) {
  data.endpoints = data.endpoints || []

  const schemaEndpoints = data.endpoints
  const $content = $('<content/>')

  $content.append('<heading>API Schemas</heading>')
  $.each(schemaEndpoints, renderEndpoint)

  $('content:first-of-type').append($content)

  function renderEndpoint (key, endpoint) {
    const $endpoint = $('<endpoint/>')
    const $schema = $('<code class="json schema" />')

    $endpoint.append($('<heading><a href="' + endpoint.schema + '">' + endpoint.method + ' ' + endpoint.schema + '</a></heading>'))
    $endpoint.append($('<p>' + endpoint.description + '</p>'))
    $endpoint.append($('<p>Accepts: ' + endpoint.accepts + '</p>'))
    $content.append($endpoint)

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

function registerExpandables () {
  $('code.schema').addClass('expandable').on('click', (ev) => {
    $(ev.target).toggleClass('expanded')
  })
}
