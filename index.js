const express = require('express')
const bodyParser = require('body-parser')
const productsRouter = require('./api/resources/products/products.routes')
const morgan = require('morgan')
const logger = require('./utils/logger')

const app = express()

app.use(bodyParser.json())
app.use(morgan('short', {
  stream: {
    write: message => logger.info(message.trim())
  }
}))

app.use('/products', productsRouter)

app.listen(3000, () => {
  logger.info('Escuchando en el puerto 3000')
})
