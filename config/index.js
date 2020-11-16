const env = process.env.NODE_ENV || 'development'

const baseSettings = {
  jwt: {},
  port: 3000
}

let envSettings = {}

switch (env) {
  case 'development':
  case 'dev':
    envSettings = require('./dev')
    break
  case 'production':
  case 'prod':
    envSettings = require('./prod')
    break
  default:
    envSettings = require('./dev')
}

module.exports = {
  ...baseSettings,
  ...envSettings
}
