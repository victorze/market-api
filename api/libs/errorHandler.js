const mongoose = require('mongoose')
const log = require('../../utils/logger')

exports.processErrors = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

exports.processErrorsDB = (err, req, res, next) => {
  if (err instanceof mongoose.Error || err.name === 'MongoError') {
    log.error('Ocurrió un error relacionado a mongoose.', err)
    err.message = 'Ocurrió un error relacionado a la base de datos. Contacte a admin@mail.com'
    err.status = 500
  }
  next(err)
}

exports.errorsInProduction = (err, req, res, next) => {
  res.status(err.status || 500)
  res.send({ message: err.message })
}

exports.errorsInDevelopment = (err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    message: err.message,
    stack: err.stack || ''
  })
}
