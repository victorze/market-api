const express = require('express')
const _ = require('underscore')
const uuidv4 = require('uuid/v4')
const validateProduct = require('./products.validate')
const log = require('../../../utils/logger')

const products = require('../../../database').products
const productsRouter = express.Router()

productsRouter.get('/', (req, res) => {
  res.json(products)
})

productsRouter.post('/', validateProduct, (req, res) => {
  let newProduct = req.body
  newProduct.id = uuidv4()
  products.push(newProduct)
  log.info("Producto agregado a la colección de productos", newProduct)
  return res.status(201).json(newProduct)
})

productsRouter.get('/:id', (req, res) => {
  for (let product of products) {
    if (product.id === req.params.id) {
      return res.json(product)
    }
  }
  res.status(404).send(`El producto con id [${req.params.id}] no existe.`)
})

productsRouter.put('/:id', validateProduct, (req, res) => {
  let id =  req.params.id
  let product = req.body

  let index = _.findIndex(products, product => product.id === id)

  if (index !== -1) {
    product.id = id
    products[index] = product
    log.info(`Producto con id [${id}] reemplazado con nuevo producto`, product)
    return res.status(200).json(product)
  } else {
    return res.status(404).send(`El producto con id [${id}] no existe.`)
  }
})

productsRouter.delete('/:id', (req, res) => {
  let index = _.findIndex(products, product => product.id === req.params.id)
  if (index == -1) {
    log.warn(
      `Producto con id [${req.params.id}] no existe. Nada que borrar`
    )
    return res.status(404).send(`Producto con id [${req.params.id}] no existe. Nada que borrar.`)
  }
  let productRemoved = products.splice(index, 1)
  return res.json(productRemoved)
})

module.exports = productsRouter
