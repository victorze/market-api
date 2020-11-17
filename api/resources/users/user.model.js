const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Usuario debe tener un username']
  },
  password: {
    type: String,
    required: [true, 'Usuario debe tener una contraseña']
  },
  email: {
    type: String,
    required: [true, 'Usuario debe tener un email']
  }
})

module.exports = mongoose.model('user', userSchema)
