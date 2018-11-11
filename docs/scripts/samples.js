/* global $ */
$.getJSON('/api/endpoints', function (data) {
  data.endpoints = data.endpoints || []

  const sampleEndpoints = data.endpoints
  const $content = $('<content/>')

  $content.append('<heading>API Samples</heading>')
  $.each(sampleEndpoints, renderEndpoint)

  $('content:first-of-type').append($content)

  function renderEndpoint (key, endpoint) {
    let $endpoint = $('<endpoint/>')
    let $sample = $('<code class="json sample" />')

    $endpoint.append($('<heading><a href="' + endpoint.sample + '">' + endpoint.method + ' ' + endpoint.sample + '</a></heading>'))
    $endpoint.append($('<p>' + endpoint.description + '</p>'))
    $endpoint.append($('<p>Accepts: ' + endpoint.accepts + '</p>'))
    $content.append($endpoint)

    if (endpoint.sample) {
      $.getJSON(endpoint.sample, (data) => {
        $sample.html(JSON.stringify(data, null, 2))
      })
      $endpoint.append($('<p>Contents:</p>'))
      $endpoint.append($sample)
    }
  }

  registerExpandables()
})

function registerExpandables () {
  $('code.schema').addClass('expandable').on('click', (ev) => {
    $(ev.target).toggleClass('expanded')
  })
}
