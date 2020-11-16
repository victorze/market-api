const express = require('express')
const bodyParser = require('body-parser')
const productsRouter = require('./api/resources/products/products.routes')
const usersRouter = require('./api/resources/users/users.routes')
const morgan = require('morgan')
const log = require('./utils/logger')
const authJWT = require('./api/libs/auth')

const passport = require('passport')
passport.use(authJWT)

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

app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  log.info(req.user)
  res.send('Api de mi aplicacion')
})

app.listen(3000, () => {
  log.info('Escuchando en el puerto 3000')
})
