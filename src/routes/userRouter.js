const Router = require('express')
const router =  new Router()
const UserController = require('../controllers/userController')

router.post('/registration', UserController.create)


router.post('/registration', UserController.create)

module.exports = router

router.post('/',(req, res, next) => {
    console.log(`Received ${req.method} request at ${req.url}`);
    console.log('Request body:', req.body);
    res.send({message: 200})// 
  });
  

  router.get('/',(req, res, next) => {
    console.log(`Received ${req.method} request at ${req.url}`);
    console.log('Request body:', req.body);
    res.send({message: 200})// 
  });
  