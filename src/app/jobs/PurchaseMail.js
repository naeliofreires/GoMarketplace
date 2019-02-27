const Mail = require('../services/Mail')

class PurchaseMail {
  get key () {
    return 'PurchaseMail'
  }

  async handle (job, done) {
    const { ad, user, content } = job.data
    await Mail.sendMail({
      from: 'Naélio Freires <naeliofreires@dev.com>',
      to: ad.author.email,
      subject: `Solicitaçãode compra: ${ad.title}`,
      template: 'purchase',
      context: { user, content, ad: ad }
    })

    return done()
  }
}

module.exports = new PurchaseMail()
