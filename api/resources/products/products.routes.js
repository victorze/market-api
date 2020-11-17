const express = require('express')
const passport = require('passport')

const validateProduct = require('./products.validate')
const log = require('../../../utils/logger')
const productRepository = require('./products.repository')
const processErrors = require('../../libs/errorHandler').processErrors
const { ProductNotExist, UserIsNotOwner } = require('./products.error')

const jwtAuthenticate = passport.authenticate('jwt', { session: false })
const productsRouter = express.Router()

function validateId(req, res, next) {
  let id = req.params.id
  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    return res.status(400).send(`El id [${id}] suministrado en el URL no es válido.`)
  }
  next()
}

productsRouter.get('/', processErrors((req, res) => {
  return productRepository.getProducts()
    .then(products => {
      res.json(products)
    })
}))

productsRouter.post('/', [jwtAuthenticate, validateProduct], processErrors((req, res) => {
  return productRepository.createProduct(req.body, req.user.username)
    .then(product => {
      log.info("Producto agregado a la colección de productos", product.toObject())
      res.status(201).json(product)
    })
}))

productsRouter.get('/:id', validateId, processErrors((req, res) => {
  const id = req.params.id
  return productRepository.getProduct(id)
    .then(product => {
      if (!product) {
        throw new ProductNotExist(`Producto con id [${req.params.id}] no existe.`)
      }
      res.json(product)
    })
}))

productsRouter.put('/:id', [jwtAuthenticate, validateId, validateProduct], processErrors(async (req, res) => {
  const id = req.params.id
  const authenticatedUser = req.user.username
  let product = await productRepository.getProduct(id)

  if (!product) {
    throw new ProductNotExist(`El producto con id [${id}] no existe.`)
  }

  if (product.owner !== authenticatedUser) {
    log.warn(`Usuario [${authenticatedUser}] no es dueño del producto con id [${id}].
        El dueño real es ${product.owner}. Request no será procesado.`)
    throw new UserIsNotOwner(`No puedes modificar el producto con id ${id}, porque no eres el dueño.`)
  }

  productRepository.updateProduct(id, req.body, authenticatedUser)
    .then(product => {
      log.info(`Producto con id [${id}] fue reemplazado con un nuevo producto`, product.toObject())
      res.json(product)
    })
}))

productsRouter.delete('/:id', [jwtAuthenticate, validateId], processErrors(async (req, res) => {
  const id = req.params.id
  let product = await productRepository.getProduct(id)

  if (!product) {
    log.info(`Producto con id [${id}] no existe. Nada que borrar`)
    throw new ProductNotExist(`Producto con id [${id}] no existe. Nada que borrar.`)
  }

  const authenticatedUser = req.user.username

  if (product.owner !== authenticatedUser) {
    log.warn(`Usuario [${authenticatedUser}] no es dueño del producto con id [${id}].
        El dueño real es ${product.owner}. Request no será procesado.`)
    throw new UserIsNotOwner(`No puedes borrar el producto con id ${id}, porque no eres el dueño.`)
  }

  let deletedProduct = await productRepository.deleteProduct(id)
  log.info(`Producto con id [${id}] fue borrado`)
  res.json(deletedProduct)
}))

module.exports = productsRouter
