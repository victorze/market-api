class UserExistsError extends Error {
  constructor(message) {
    super(message)
    this.message = message || 'El email o usuario ya están asociados con una cuenta.'
    this.status = 409
    this.name = "UsuarioExisteError"
  }
}

class IncorrectCredentials extends Error {
  constructor(message) {
    super(message)
    this.message = message || 'Credenciales incorrectas. Asegúrese que el user name y contraseña sean correctas.'
    this.status = 400
    this.name = 'IncorrectCredentials'
  }
}

module.exports = {
  UserExistsError,
  IncorrectCredentials
}
