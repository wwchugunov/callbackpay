const { merchant } = require('../models/model');
const { Op } = require('sequelize');


class MerchantController {
    async edit(req, res){
        res.send('200')
    }           
}


module.exports = new MerchantController()