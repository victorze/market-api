const express = require('express')
const passport = require('passport')

const validateProduct = require('./products.validate')
const log = require('../../../utils/logger')
const productRepository = require('./products.repository')

const jwtAuthenticate = passport.authenticate('jwt', { session: false })
const productsRouter = express.Router()

function validateId(req, res, next) {
  let id = req.params.id
  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    return res.status(400).send(`El id [${id}] suministrado en el URL no es válido.`)
  }
  next()
}

productsRouter.get('/', (req, res) => {
  productRepository.getProducts()
    .then(products => {
      res.json(products)
    })
    .catch(err => {
      res.status(500).send("Error al leer los productos de la base de datos")
    })
})

productsRouter.post('/', [jwtAuthenticate, validateProduct], (req, res) => {
  productRepository.createProduct(req.body, req.user.username)
    .then(product => {
      log.info("Producto agregado a la colección de productos", product.toObject())
      res.status(201).json(product)
    })
    .catch(err => {
      log.error("No pudo ser creado el producto", err)
      res.status(500).send("Ocurrio un error al tratar de crear el producto.")
    })
})

productsRouter.get('/:id', validateId, (req, res) => {
  const id = req.params.id
  productRepository.getProduct(id)
    .then(product => {
      if (!product) {
        res.status(404).send(`Producto con id [${req.params.id}] no existe.`)
      }
      res.json(product)
    })
    .catch(err => {
      log.error(`Ocurrió una excepción al tratar de obtener un producto con [${id}]`, err)
      res.status(500).send(`Ocurrió un error al tratar de obtener un producto con id [${id}].`)
    })
})

productsRouter.put('/:id', [jwtAuthenticate, validateId, validateProduct], async (req, res) => {
  const id = req.params.id
  const authenticatedUser = req.user.username
  let product

  try {
    product = await productRepository.getProduct(id)
    console.log(product)
  } catch (err) {
    log.error(`Ocurrió una excepción al modificar un producto con id [${id}]`, err)
    return res.status(500).send(`Ocurrió un error al modificar un producto con id [${id}]`)
  }

  if (!product) {
    return res.status(404).send(`El producto con id [${id}] no existe.`)
  }

  if (product.owner !== authenticatedUser) {
    log.warn(`Usuario [${authenticatedUser}] no es dueño del producto con id [${id}].
        El dueño real es ${product.owner}. Request no será procesado.`)
    return res.status(401).send(`No puedes modificar el producto con id ${id}, porque no eres el dueño.`)
  }

  productRepository.updateProduct(id, req.body, authenticatedUser)
    .then(product => {
      log.info(`Producto con id [${id}] fue reemplazado con un nuevo producto`, product.toObject())
      res.json(product)
    })
    .catch(err => {
      log.error(`Excepción al tratar de reemplazar un producto con id [${id}]`, err)
      res.status(500).send(`Ocurrió un error al reemplazar un producto con id [${id}]`)
    })
})

productsRouter.delete('/:id', [jwtAuthenticate, validateId], async (req, res) => {
  const id = req.params.id
  let product

  try {
    product = await productRepository.getProduct(id)
  } catch (err) {
    log.error(`Ocurrió una excepción al borrar un producto con id [${id}]`, err)
    return res.status(500).send(`Ocurrió un error al borrar un producto con id [${id}]`)
  }

  if (!product) {
    log.info(`Producto con id [${id}] no existe. Nada que borrar`)
    return res.status(404).send(`Producto con id [${id}] no existe. Nada que borrar.`)
  }

  const authenticatedUser = req.user.username

  if (product.owner !== authenticatedUser) {
    log.warn(`Usuario [${authenticatedUser}] no es dueño del producto con id [${id}].
        El dueño real es ${product.owner}. Request no será procesado.`)
    return res.status(401).send(`No puedes borrar el producto con id ${id}, porque no eres el dueño.`)
  }

  try {
    let deletedProduct = await productRepository.deleteProduct(id)
    res.json(deletedProduct)
  } catch (err) {
    res.status(500).send(`Ocurrió un error al borrar un producto con id [${id}]`)
  }
})

module.exports = productsRouter
