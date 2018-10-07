const express = require('express')
const app = express()
const position = require('promise-path').position(__dirname)

const phpExpress = require('php-express')({
  binPath: 'php' // assumes php is in your PATH
})

app.use('/docs/design', express.static(position('docs/design')))
app.use('/docs/scripts', express.static(position('docs/scripts')))
app.get('/api/*', render(position('api/index.php')))
app.post('/api/*', render(position('api/index.php')))
app.get('/docs/*', render(position('docs/index.php')))
app.get('/', render(position('index.php')))

function render (phpScriptPath) {
  return (req, res) => {
    console.log('[PHP Test Server]', req.url, 'rendered using', phpScriptPath)
    phpExpress.engine(phpScriptPath, {
      method: req.method,
      get: req.query,
      post: req.body,
      server: {
        REQUEST_URI: req.url,
        HTTP_HOST: req.header('host'),
        HTTPS: true
      }
    }, (err, body) => {
      if (err) {
        res.status(500).send({ error: err })
      } else {
        res.send(body)
      }
    })
  }
}

const server = app.listen(4000, function () {
  const port = server.address().port
  console.log('[PHP Test Server] listening at http://%s:%s/', 'localhost', port)
})
