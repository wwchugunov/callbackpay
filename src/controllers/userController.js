const { merchant } = require('../models/model');
const { Op } = require('sequelize');


class UserController {
    async create(req, res){
        res.send('200')
    }           
}


module.exports = new UserController()