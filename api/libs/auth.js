const passportJWT = require('passport-jwt')

const log = require('../../utils/logger')
const config = require('../../config')
const userRepository = require('../resources/users/user.repository')

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  userRepository.getUser({ id: jwtPayload.id })
    .then(user => {
      if (!user) {
        log.info(`JWT token no es válido. Usuario con id ${jwtPayload.id} no existe.`)
        return next(null, false)
      }

      log.info(`Usuario ${user.username} suministró un token válido. Autenticación completada.`)
      // El objeto (segundo argumento) se agrega a req.user
      next(null, {
        username: user.username,
        id: user.id,
      })
    })
    .catch(err => {
      log.error('Ocurrió un error al tratar de validar un token.', err)
      next(err)
    })
})
