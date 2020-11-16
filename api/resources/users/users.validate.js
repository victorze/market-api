const Joi = require('joi')
const log = require('../../../utils/logger')

const blueprintUser = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).max(200).required(),
  email: Joi.string().email().required()
})

const validateUser = (req, res, next) => {
  const result = blueprintUser.validate(req.body, { abortEarly: false, convert: false })
  if (!result.error) {
    next()
  } else {
    log.info("Usuario falló la validación", result.error.details.map(error => error.message))
    res.status(400).send("Información del usuario no cumple los requisitos. El nombre del usuario debe ser alafanúmerico y tener entre 3 y 30 carácteres. La contraseña debe tener entre 6 y 200 carácteres. Asegúrate de que el email sea válido.")
  }
}

const blueprintUserLogin = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
})

const validateLogin = (req, res, next) => {
  const result = blueprintUserLogin.validate(req.body, { abortEarly: false, convert: false })
  if (!result.error) {
    next()
  } else {
    res.status(400).send({message: "Login falló. Usuario o constraseña incorrecto"})
  }
}

module.exports = {
  validateUser,
  validateLogin
}
