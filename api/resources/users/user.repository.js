const User = require('./user.model')

function getUsers() {
  return User.find({})
}

function getUser({ username: username, id: id }) {
  if (username) return User.findOne({ username: username })
  if (id) return User.findById(id)
  throw new Error('La función getUser fue llamada sin especificar username o id')
}

function createUser(user, hashedPassword) {
  return new User({
    ...user,
    password: hashedPassword
  }).save()
}

function userExists(username, email) {
  return new Promise((resolve, reject) => {
    User.find().or([{ username }, { email }])
      .then(users => {
        resolve(users.length > 0)
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  userExists,
}
