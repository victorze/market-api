const express = require('express')
const _ = require('underscore')
const uuidv4 = require('uuid/v4')
const passport = require('passport')

const validateProduct = require('./products.validate')
const log = require('../../../utils/logger')
const products = require('../../../database').products
const jwtAuthenticate = passport.authenticate('jwt', { session: false })

const productsRouter = express.Router()

productsRouter.get('/', (req, res) => {
  res.json(products)
})

productsRouter.post('/', [jwtAuthenticate, validateProduct], (req, res) => {
  let product = {
    ...req.body,
    id: uuidv4(),
    owner: req.user.username
  }

  product.id = uuidv4()
  products.push(product)
  log.info("Producto agregado a la colección de productos", product)
  return res.status(201).json(product)
})

productsRouter.get('/:id', (req, res) => {
  for (let product of products) {
    if (product.id === req.params.id) {
      return res.json(product)
    }
  }
  res.status(404).send(`Producto con id [${req.params.id}] no existe.`)
})

productsRouter.put('/:id', [jwtAuthenticate, validateProduct], (req, res) => {
  let product = {
    ...req.body,
    id: req.params.id,
    owner: req.user.username
  }

  let index = _.findIndex(products, p => p.id === product.id)

  if (index !== -1) {
    if (products[index].owner !== product.owner) {
      log.info(`Usuario ${req.user.username} no es dueño del producto con id ${product.id}.
        El dueño real es ${products[index].owner}. Request no será procesado.`)
      return res.status(400).send(`No puedes modificar el producto con id ${product.id}, porque no eres el dueño.`)
    }
    products[index] = product
    log.info(`Producto con id [${product.id}] reemplazado con nuevo producto`, product)
    return res.status(200).json(product)
  } else {
    return res.status(404).send(`El producto con id [${product.id}] no existe.`)
  }
})

productsRouter.delete('/:id', jwtAuthenticate, (req, res) => {
  let index = _.findIndex(products, p => p.id === req.params.id)
  if (index === -1) {
    log.warn(`Producto con id [${req.params.id}] no existe. Nada que borrar`)
    return res.status(404).send(`Producto con id [${req.params.id}] no existe. Nada que borrar.`)
  }

  if (products[index].owner !== req.user.username) {
    log.info(`Usuario ${req.user.username} no es dueño del producto con id ${products[index].id}.
        El dueño real es ${products[index].owner}. Request no será procesado.`)
    return res.status(400).send(`No puedes borrar el producto con id ${products[index].id}, porque no eres el dueño.`)
  }

  let productRemoved = products.splice(index, 1)
  return res.json(productRemoved)
})

module.exports = productsRouter
