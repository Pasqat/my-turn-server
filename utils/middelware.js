const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('-'.repeat(3))
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'})
}

module.exports = {
  requestLogger,
  unknownEndpoint
}
