const Joi = require('joi')

const blueprintProduct = Joi.object({
  title: Joi.string().max(100).required(),
  price: Joi.number().positive().precision(2).required(),
  currency: Joi.string().length(3).uppercase()
})

module.exports = (req, res, next) => {
  let result = blueprintProduct.validate(req.body, { abortEarly: false, convert: false })
  if (result.error === undefined) {
    next()
  } else {
    let validationErrors = result.error.details.reduce((acc, error) => {
      return acc + `[${error.message}]`
    }, "")
    res.status(404).send(`El producto en el body debe especificar titulo, precio y moneda.
      Errores en tu request: ${validationErrors}`)
  }
}

