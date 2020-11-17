const Product = require('./products.model')

function createProduct(product, owner) {
  return new Product({
    ...product,
    owner
  }).save()
}

function getProducts() {
  return Product.find({})
}

function getProduct(id) {
  return Product.findById(id)
}

function deleteProduct(id) {
  return Product.findByIdAndRemove(id)
}

function updateProduct(id, product, username) {
  return Product.findByIdAndUpdate(
    { _id: id },
    { ...product, owner: username },
    { new: true }) // retorna el objeto modificado
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct
}
