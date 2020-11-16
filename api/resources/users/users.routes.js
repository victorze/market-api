const express = require('express')
const _ = require('underscore')
const uuidv4 = require('uuid/v4')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const log = require('../../../utils/logger')
const { validateUser, validateLogin } = require('./users.validate')
const users = require('../../../database').users
const config = require('../../../config')

const usersRouter = express.Router()

usersRouter.get('/', (req, res) => {
  res.json(users)
})

usersRouter.post('/', validateUser, (req, res) => {
  let newUser = req.body
  let index = _.findIndex(users, user => {
    return user.username == newUser.username || user.email === newUser.email
  })

  if (index !== -1) {
    log.info('Email o username ya existe en la base de datos')
    return res.status(409).send('El email o username ya están asociados a una cuenta')
  }

  bcrypt.hash(newUser.password, 10, (err, hashedPassword) => {
    if (err) {
      log.error('Ocurrió un error al tratar de obtener el hash de una contraseña')
      return res.status(500).send("Ocurrió un error procesando creación del usuario")
    }

    users.push({
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword,
      id: uuidv4()
    })

    log.info("Usuario creado", {...newUser, password: hashedPassword})
    res.status(201).send("Usuario creado exitósamente")
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
