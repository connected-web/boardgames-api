/* global $ */
$.getJSON('/api/endpoints', function (data) {
  data.endpoints = data.endpoints || []

  const apiEndpoints = data.endpoints.filter(e => e.schema && e.sample)
  const $content = $('<content/>')

  $content.append('<heading>Available Endpoints</heading>')
  $.each(apiEndpoints, renderEndpoint)

  $('content:first-of-type').append($content)

  function renderEndpoint (key, endpoint) {
    const $endpoint = $('<endpoint/>')
    const $sample = $('<code class="json sample" />')

    const displayExample = endpoint.example || endpoint.path

    $endpoint.append($('<heading><a href="' + displayExample + '">' + endpoint.method + ' ' + endpoint.path + '</a></heading>'))
    $endpoint.append($('<p>' + endpoint.description + '</p>'))
    $endpoint.append($('<p>Accepts: ' + endpoint.accepts + '</p>'))

    if (displayExample) {
      $.getJSON(displayExample, (data) => {
        $sample.html(JSON.stringify(data, null, 2))
      })
      $endpoint.append($sample)
    }

    if (endpoint.sample) {
      $endpoint.append($('<p>Sample: <a href="' + endpoint.sample + '">' + endpoint.sample + '</a></p>'))
    }

    if (endpoint.schema) {
      $endpoint.append($('<p>Schema: <a href="' + endpoint.schema + '">' + endpoint.schema + '</a></p>'))
    }

    $content.append($endpoint)
  }

  registerExpandables()
})

function registerExpandables () {
  $('code.sample').addClass('expandable').on('click', (ev) => {
    $(ev.target).toggleClass('expanded')
  })
}
