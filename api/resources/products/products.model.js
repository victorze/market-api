const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Producto debe tener un título']
  },
  price: {
    type: Number,
    required: [true, 'Producto debe tener un precio']
  },
  currency: {
    type: String,
    maxlength: 3,
    minlength: 3,
    required: [true, 'Producto debe tener una moneda']
  },
  owner: {
    type: String,
    required: [true, 'Producto debe estar asociado a un usuario']
  }
}, {
  timestamps: true,
  versionKey: false
})

module.exports = mongoose.model('producto', productSchema)
