const express = require('express')
const bodyParser = require('body-parser')
const uuidv4 = require('uuid/v4')
const _ = require('underscore')

const app = express()
app.use(bodyParser.json())

const products = [
  { id: '1', title: 'Mackbook pro', price: 1300, currency: 'USD' },
  { id: '2', title: 'Tasa de té', price: 10, currency: 'USD' },
  { id: '3', title: 'Microfono blue', price: 100, currency: 'USD' },
]

app.route('/products')
  .get((req, res) => {
    res.json(products)
  })
  .post((req, res) => {
    let newProduct = req.body
    console.log("Body", req.body)
    if (!newProduct.title || !newProduct.price || !newProduct.currency) {
      // Bad request
      return res.status(400).send("Tu producto debe especificar un título, precio y moneda.")
    }
    newProduct.id = uuidv4()
    products.push(newProduct)
    return res.status(201).json(newProduct)
  })

app.route('/products/:id')
  .get((req, res) => {
    for (let product of products) {
      if (product.id === req.params.id) {
        return res.json(product)
      }
    }
    res.status(404).send(`El producto con id [${req.params.id}] no existe.`)
  })
  .put((req, res) => {
    let id =  req.params.id
    let product = req.body

    if (!product.title || !product.price || !product.currency) {
      return res.status(400).send("Tu producto debe especificar un título, precio y moneda.")
    }

    let index = _.findIndex(products, product => product.id === id)

    if (index !== -1) {
      product.id = id
      products[index] = product
      return res.status(200).json(product)
    } else {
      return res.status(404).send(`El producto con id [${id}] no existe.`)
    }
  })
  .delete((req, res) => {
    let index = _.findIndex(products, product => product.id === req.params.id)
    if (index == -1) {
      return res.status(404).send(`Producto con id [${req.params.id}] no existe. Nada que borrar.`)
    }
    let productRemoved = products.splice(index, 1)
    return res.json(productRemoved)
  })

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(3000, () => {
  console.log('Escuchando en el puerto 3000')
})
