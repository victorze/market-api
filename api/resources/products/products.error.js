class ProductNotExist extends Error {
  constructor(message) {
    super(message)
    this.message = message || 'Producto no existe. Operación no puede ser completada.'
    this.status = 404
    this.name = 'ProductNotExist'
  }
}

class UserIsNotOwner extends Error {
  constructor(message) {
    super(message)
    this.message = message || 'No eres propietario del producto. Operación no puede ser completada'
    this.status = 401
    this.name = 'UserIsNotOwner'
  }
}

module.exports = {
  ProductNotExist,
  UserIsNotOwner
}
