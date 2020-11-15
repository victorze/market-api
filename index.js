const express = require('express')
const bodyParser = require('body-parser')
const productsRouter = require('./api/resources/products/products.routes')
const usersRouter = require('./api/resources/users/users.routes')
const morgan = require('morgan')
const logger = require('./utils/logger')

const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy

passport.use(new BasicStrategy(
  (username, password, done) => {
    if (username.valueOf() === 'victorze' &&  password.valueOf() === 'secret') {
      return done(null, true)
    } else {
      return done(null, false)
    }
  }
))

const app = express()
app.use(bodyParser.json())
app.use(morgan('short', {
  stream: {
    write: message => logger.info(message.trim())
  }
}))

app.use(passport.initialize())

app.use('/products', productsRouter)
app.use('/users', usersRouter)

app.get('/', passport.authenticate('basic', { session: false }), (req, res) => {
  res.send('Api de mi aplicacion')
})

app.listen(3000, () => {
  logger.info('Escuchando en el puerto 3000')
})
