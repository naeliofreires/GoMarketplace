const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const configJWT = require('../../config/auth')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// definimos uma ação para acontecer antes ou depois, como os hooks do Sequelize
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  this.password = await bcrypt.hash(this.password, 8)
})

// aqui podemos declarar metodos que a instancia usuario irá ter
UserSchema.methods = {
  compareHash (password) {
    return bcrypt.compare(password, this.password)
  }
}

// metodo static é disparado do Model, não na instancia
UserSchema.statics = {
  generateToken ({ id }) {
    return jwt.sign({ id }, configJWT.secret, {
      expiresIn: configJWT.ttl
    })
  }
}

module.exports = mongoose.model('User', UserSchema)
