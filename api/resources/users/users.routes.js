const express = require('express')
const _ = require('underscore')
const uuidv4 = require('uuid/v4')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const log = require('../../../utils/logger')
const { validateUser, validateLogin } = require('./users.validate')
const users = require('../../../database').users
const config = require('../../../config')
const userRepository = require('./user.repository')
const { has } = require('underscore')

const usersRouter = express.Router()

usersRouter.get('/', (req, res) => {
  userRepository.getUsers()
    .then(users => {
      res.json(users)
    })
    .catch(err => {
      log.error('Error al obtener todos los usuarios', err)
      res.sendStatus(500)
    })
})

usersRouter.post('/', validateUser, (req, res) => {
  const user = req.body
  userRepository.userExists(user.username, user.email)
    .then(userExists => {
      if (userExists) {
        log.warn('Email o username ya existe en la base de datos')
        return res.status(409).send('El email o username ya están asociados a una cuenta')
      }

      bcrypt.hash(user.password, 10, (err, hashedPassword) => {
        if (err) {
          log.error('Ocurrió un error al tratar de obtener el hash de una contraseña', err)
          return res.status(500).send("Ocurrió un error procesando creación del usuario")
        }

        userRepository.createUser(user, hashedPassword)
          .then(user => {
            log.info("Usuario creado", { ...user, password: hashedPassword })
            res.status(201).send("Usuario creado exitósamente")
          })
          .catch(err => {
            log.error('Ocurrió un error al tratar de crear un nuevo usuario', user)
            res.status(500).send('Ocurrio un error al tratar de crear un nuevo usuario.')
          })

      })
    })
    .catch(err => {
      log.error(`Ocurrió un error al tratar de verificar si ya existe un usuario
        [${user.usernmae}] con email [${user.email}]`)
      res.status(500).send('Ocurrió un error al tratar de crear un nuevo usuario.')
    })
})

usersRouter.post('/login', validateLogin, (req, res) => {
  user = req.body
  let index = _.findIndex(users, u => u.username === user.username)

  if (index === -1) {
    log.info(`Usuario ${user.username} no pudo ser autenticado`)
    return res.status(400).send('Credenciales incorrectas. El usuario no existe')
  }

  let hashedPassword = users[index].password
  bcrypt.compare(user.password, hashedPassword, (err, matchPassword) => {
    if (matchPassword) {
      const token = jwt.sign({ id: users[index].id }, config.jwt.secret, { expiresIn: config.jwt.expiryTime })
      log.info(`Usuario ${user.username} completó autenticación exitosamente`)
      res.status(200).json({ token })
    } else {
      log.info(`Usuario ${user.username} no completó autenticación. Contraseña incorrecta`)
      res.status(400).send('Credenciales incorrectas. Asegúrate que el username y contraseña sean correctas')
    }
  })
})

module.exports = usersRouter
