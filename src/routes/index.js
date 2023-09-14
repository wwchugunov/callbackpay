const Router = require('express')
const router =  new Router()
const merchantrouter = require('./merchantRouter')
const userrouter = require('./userRouter')
const botRouter = require('./botRouter')




router.use('/merchant', merchantrouter)
router.use('/user', userrouter)
router.use('/bot', botRouter)




module.exports = router