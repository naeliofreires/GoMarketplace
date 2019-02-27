require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const Sentry = require('@sentry/node')
const validate = require('express-validation')
const configDB = require('./config/database')
const configSentry = require('./config/sentry')

const Youch = require('youch')

class App {
  constructor () {
    this.express = express()
    this.isDev = process.env.NODE_ENV !== 'production'

    this.sentry()
    this.database()
    this.middlewares()
    this.routes()
    this.exception()
  }

  sentry () {
    Sentry.init({
      dsn: configSentry.dsn
    })
  }

  database () {
    // realizando conexão
    // mongodb:usuario:senha@localhost:27017/nomedobanco
    mongoose.connect(configDB.uri, {
      // informando ao mongoose que estamos usando a versao mais
      // recente do Node e ele precisa fazer umas adaptações
      useCreateIndex: true,
      useNewUrlParser: true
    })
  }

  middlewares () {
    this.express.use(express.json())
    this.express.use(Sentry.Handlers.requestHandler())
  }

  routes () {
    this.express.use(require('./routes'))
  }

  exception () {
    if (process.env.NODE_ENV === 'production') {
      this.express.use(Sentry.Handlers.errorHandler())
    }

    this.express.use(async (err, req, res, next) => {
      if (err instanceof validate.ValidationError) {
        return res.status(err.status).json(err)
      }

      if (process.env.NODE_ENV !== 'production') {
        const youch = new Youch(err, req)

        return res.json(await youch.toJSON()) // também tem o formato em html
      }

      return res
        .status(err.status || 500)
        .json({ error: 'Internal Server Error' })
    })
  }
}

module.exports = new App().express
