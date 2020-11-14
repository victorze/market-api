const express = require('express')
const bodyParser = require('body-parser')
const productsRouter = require('./api/resources/products/products.routes')

const app = express()
app.use(bodyParser.json())

app.use('/products', productsRouter)

app.listen(3000, () => {
  console.log('Escuchando en el puerto 3000')
})
