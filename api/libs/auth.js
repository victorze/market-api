const _ = require('underscore')
const log = require('../../utils/logger')
const users = require('../../database').users
const bcrypt = require('bcrypt')
const passportJWT = require('passport-jwt')

const jwtOptions = {
  secretOrKey: 'secret',
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  let index = _.findIndex(users, user => user.id === jwtPayload.id)

  if (index === -1) {
    log.info(`JWT token no es válido. Usuario con id ${jwtPayload.id} no existe.`)
    next(null, false)
  } else {
    log.info(`Usuario ${users[index].username} suministró un token válido. Autenticación completada.`)

    // El objeto (segundo argumento) se agrega a req.user
    next(null, {
      username: users[index].username,
      id: users[index].id,
    })
  }
})
