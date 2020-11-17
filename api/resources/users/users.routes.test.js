const request = require('supertest')

const User = require('./user.model')
const { app, server } = require('../../../index')

describe('Users', () => {
  beforeEach(done => {
    User.remove({}, err => {
      done()
    })
  })

  afterAll(() => {
    server.close()
  })

  describe('GET /products', () => {
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
  })
})
