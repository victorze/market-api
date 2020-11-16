const _ = require('underscore')
const log = require('../../utils/logger')
const users = require('../../database').users
const bcrypt = require('bcrypt')

module.exports = (username, password, done) => {
  let index = _.findIndex(users, user => user.username = username)

  if (index === -1) {
    log.info(`Usuario ${username} no pudo ser autenticado`)
    return done(null, false)
  }

  let hashedPassword = users[index].password
  bcrypt.compare(password, hashedPassword, (err, matchPassword) => {
    if (matchPassword) {
      log.info(`Usuario ${username} completó autenticación`)
      done(null, true)
    } else {
      log.info(`Usuario ${username} no completó autenticación. Contraseña incorrecta`)
      done(null, false)
    }
  })
}
