const User = require('./user.model')

function getUsers() {
  return User.find({})
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
  createUser,
  userExists,
}
