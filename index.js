const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(3000, () => {
  console.log('Escuchando en el puerto 3000')
})
