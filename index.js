const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')

const productsRouter = require('./api/resources/products/products.routes')
const usersRouter = require('./api/resources/users/users.routes')
const log = require('./utils/logger')
const authJWT = require('./api/libs/auth')
const config = require('./config')
const errorHandler = require('./api/libs/errorHandler')

const passport = require('passport')
passport.use(authJWT)

mongoose.connect('mongodb://localhost:27017/market-api')
mongoose.connection.on('error', () => {
  log.error('Falló la conexión a mongodb')
  process.exit(1)
})

const app = express()

app.use(bodyParser.json())
app.use(morgan('short', {
  stream: {
    write: message => log.info(message.trim())
  }
}))

app.use(passport.initialize())

app.use('/products', productsRouter)
app.use('/users', usersRouter)

app.use(errorHandler.processErrorsDB)
if (config.env === 'prod') {
  app.use(errorHandler.errorsInProduction)
} else {
  app.use(errorHandler.errorsInDevelopment)
}

app.listen(config.port, () => {
  log.info('Escuchando en el puerto 3000')
})
