const Ad = require('../models/Ad')
const User = require('../models/User')
const PurchaseModel = require('../models/Purchase')

const PurchaseMail = require('../jobs/PurchaseMail')
const Queue = require('../services/Queue')

class PurchaseController {
  async store (req, res) {
    const { ad, content } = req.body

    const purchaseAd = await Ad.findById(ad).populate('author')
    const user = await User.findById(req.userId)

    if (purchaseAd) {
      const newPurchase = {
        ad,
        user: req.userId,
        content
      }

      const purchase = await PurchaseModel.create(newPurchase)

      Queue.create(PurchaseMail.key, {
        ad: purchaseAd,
        user,
        content
      }).save()

      return res.json(purchase)
    }

    return res.stat(404).send('Ad Not Found!')
  }

  async acceptPurchase (req, res) {
    const { ad, user } = req.body

    const _ad = await Ad.findById(ad)
    const _user = await User.findById(user)

    if (_ad && _user) {
      _ad.purchasedBy = user
      await _ad.save()

      return res.json(_ad)
    }
  }
}

module.exports = new PurchaseController()
