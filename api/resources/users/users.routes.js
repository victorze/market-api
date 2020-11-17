const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const log = require('../../../utils/logger')
const { validateUser, validateLogin } = require('./users.validate')
const config = require('../../../config')
const userRepository = require('./user.repository')
const processErrors = require('../../libs/errorHandler').processErrors

const usersRouter = express.Router()

class UserExistsError extends Error {
  constructor(message) {
    super(message)
    this.message = message || 'El email o usuario ya están asociados con una cuenta.'
    this.status = 409
    this.name = "UsuarioExisteError"
  }
}

function bodyToLowerCase(req, res, next) {
  req.body.username && (req.body.username = req.body.username.toLowerCase())
  req.body.email && (req.body.email = req.body.email.toLowerCase())
  next()
}

usersRouter.get('/', processErrors((req, res) => {
  return userRepository.getUsers()
    .then(users => {
      res.json(users)
    })
}))

usersRouter.post('/', [validateUser, bodyToLowerCase], processErrors((req, res) => {
  const user = req.body
  return userRepository.userExists(user.username, user.email)
    .then(userExists => {
      if (userExists) {
        log.warn('Email o username ya existe en la base de datos')
        throw new UserExistsError()
      }

      return bcrypt.hash(user.password, 10)
    })
    .then(hashedPassword => {
      return userRepository.createUser(user, hashedPassword)
        .then(user => {
          log.info("Usuario creado", { ...user, password: hashedPassword })
          res.status(201).send("Usuario creado exitósamente")
        })
    })
}))

usersRouter.post('/login', [validateLogin, bodyToLowerCase], processErrors(async (req, res) => {
  const user = req.body

  const registeredUser = await userRepository.getUser({ username: user.username })
  if (!registeredUser) {
    log.info(`Usuario ${user.username} no pudo ser autenticado`)
    return res.status(400).send('Credenciales incorrectas. Asegúrate que el username y contraseña sean correctas.')
  }
  const correctPassword = await bcrypt.compare(user.password, registeredUser.password)

  if (correctPassword) {
    const token = jwt.sign({ id: registeredUser.id }, config.jwt.secret, { expiresIn: config.jwt.expiryTime })
    log.info(`Usuario ${user.username} completó autenticación exitosamente`)
    res.status(200).json({ token })
  } else {
    log.info(`Usuario ${user.username} no completó autenticación. Contraseña incorrecta`)
    res.status(400).send('Credenciales incorrectas. Asegúrate que el username y contraseña sean correctas')
  }
}))

module.exports = usersRouter
