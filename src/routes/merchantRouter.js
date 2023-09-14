const Router = require('express')
const router =  new Router()
const MerchantController = require('../controllers/merchantController')





router.put('/edit/:id', MerchantController.edit)



module.exports = router