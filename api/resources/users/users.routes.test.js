const request = require('supertest')
const bcrypt = require('bcrypt')

const User = require('./user.model')
const { app, server } = require('../../../index')
const { compareSync } = require('bcrypt')

const dummyUsers = [
  {
    username: 'foo',
    email: 'foo@mail.com',
    password: 'foofoo'
  },
  {
    username: 'bar',
    email: 'bar@mail.com',
    password: 'barbar'
  },
  {
    username: 'baz',
    email: 'baz@mail.com',
    password: 'bazbaz'
  }
]

function userExistsAndAttributesAreCorrect(user, done) {
  User.find({ username: user.username })
    .then(users => {
      expect(users).toBeInstanceOf(Array)
      expect(users).toHaveLength(1)
      expect(users[0].username).toEqual(user.username)
      expect(users[0].email).toEqual(user.email)

      let equals = bcrypt.compareSync(user.password, users[0].password)
      expect(equals).toBeTruthy()
      done()
    })
    .catch(err => {
      done(err)
    })
}

async function userNotExist(user, done) {
  try {
    let users = await User.find().or([{ username: user.username }, { email: user.email }])
    expect(users).toHaveLength(0)
    done()
  } catch (err) {
    done(err)
  }
}

describe('Users', () => {
  beforeEach(done => {
    User.remove({}, err => {
      done()
    })
  })

  afterAll(() => {
    server.close()
  })

  describe('GET /users', () => {
    test('Si no hay usuarios, debería retornar un array vacío', done => {
      request(app)
        .get('/users')
        .end((err, res) => {
          expect(res.status).toBe(200)
          expect(res.body).toBeInstanceOf(Array)
          expect(res.body).toHaveLength(0)
          done()
        })
    })

    test('Si existen usuarios, debería retornarlos en un array', done => {
      Promise.all(dummyUsers.map(user => (new User(user)).save()))
        .then(users => {
          request(app)
            .get('/users')
            .end((err, res) => {
              expect(res.status).toBe(200)
              expect(res.body).toBeInstanceOf(Array)
              expect(res.body).toHaveLength(3)
              done()
            })
        })
    })
  })

  describe('POST /users', () => {
    test('Un usuario que cumple las condiciones debería ser creado', done => {
      request(app)
        .post('/users')
        .send(dummyUsers[0])
        .end((err, res) => {
          expect(res.status).toBe(201)
          expect(typeof res.text).toBe('string')
          expect(res.text).toEqual('Usuario creado exitósamente')
          userExistsAndAttributesAreCorrect(dummyUsers[0], done)
        })
    })

    test('Crear un usuario con un username ya registrado debería fallar', done => {
      Promise.all(dummyUsers.map(user => (new User(user)).save()))
        .then(users => {
          request(app)
            .post('/users')
            .send({
              username: 'foo',
              email: 'foobar@mail.com',
              password: 'secret'
            })
            .end((err, res) => {
              expect(res.status).toBe(409)
              expect(typeof res.text).toBe('string')
              done()
            })
        })
    })

    test('Crear un usuario con un email ya registrado debería fallar', done => {
      Promise.all(dummyUsers.map(user => (new User(user)).save()))
        .then(users => {
          request(app)
            .post('/users')
            .send({
              username: 'foobar',
              email: 'foo@mail.com',
              password: 'secret'
            })
            .end((err, res) => {
              expect(res.status).toBe(409)
              expect(typeof res.text).toBe('string')
              done()
            })
        })
    })

    test('Un usuario sin username no debería ser creado', done => {
      request(app)
        .post('/users')
        .send({
          email: 'foo@mail.com',
          password: 'secret'
        })
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(typeof res.text).toBe('string')
          done()
        })
    })

    test('Un usuario sin contraseña no debería ser creado', (done) => {
      request(app)
        .post('/users')
        .send({
          username: 'foo',
          email: 'foo@mail.com',
        })
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(typeof res.text).toBe('string')
          done()
        })
    })

    test('Un usuario sin email no debería ser creado', (done) => {
      request(app)
        .post('/users')
        .send({
          username: 'foo',
          password: 'secret'
        })
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(typeof res.text).toBe('string')
          done()
        })
    })

    test('Un usuario con un email inválido no debería ser creado', (done) => {
      let user = {
        username: 'foo',
        email: '@mail.com',
        password: 'secret'
      }
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(typeof res.text).toBe('string')
          userNotExist(user, done)
        })
    })

    test('Un usuario con un username con menos de 3 caracteres no debería ser creado', (done) => {
      let user = {
        username: 'fo',
        email: 'foo@gmail.com',
        password: 'secret'
      }
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(typeof res.text).toBe('string')
          userNotExist(user, done)
        })
      }
    )

    test('Un usuario con un username con más de 30 caracteres no debería ser creado', (done) => {
      let user = {
        username: 'daniel'.repeat(10),
        email: 'daniel@gmail.com',
        password: 'contraseña'
      }
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(typeof res.text).toBe('string')
          userNotExist(user, done)
        })
      }
    )

    test('Un usuario cuya contraseña tenga menos de 6 caracteres no debería ser creado', (done) => {
      let user = {
        username: 'daniel',
        email: 'daniel@gmail.com',
        password: 'abc'
      }
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(typeof res.text).toBe('string')
          userNotExist(user, done)
        })
      }
    )

    test('Un usuario cuya contraseña tenga más de 200 caracteres no debería ser creado', (done) => {
      let user = {
        username: 'daniel',
        email: 'daniel@gmail.com',
        password: 'contraseña'.repeat(40)
      }
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(typeof res.text).toBe('string')
          userNotExist(user, done)
        })
      }
    )

    test('El username y email de un usuario válido deben ser guardados en lowercase', (done) => {
      let user = {
        username: 'Foo',
        email: 'FOO@Mail.com',
        password: 'secret'
      }
      request(app)
        .post('/users')
        .send(user)
        .end((err, res) => {
          expect(res.status).toBe(201)
          expect(typeof res.text).toBe('string')
          expect(res.text).toEqual('Usuario creado exitósamente')
          userExistsAndAttributesAreCorrect({
            username: user.username.toLowerCase(),
            email: user.email.toLowerCase(),
            password: user.password
          }, done)
        })
    })
  })
})
