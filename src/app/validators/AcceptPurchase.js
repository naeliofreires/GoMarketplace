const Joi = require('joi')

module.exports = {
  body: {
    ad: Joi.string().required(),
    user: Joi.string().required()
  }
}
