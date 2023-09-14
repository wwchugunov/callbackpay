const Router = require('express')
const router =  new Router()
const botController = require('../controllers/botController')





router.post('/callback', botController.start)



module.exports = router

// BotOn