const { merchant } = require('../models/model');
// const bot = require('../bots/bot')
const { Op } = require('sequelize');


class botController {
    async start(req, res) {
        console.log('Обработка запроса в контроллере');
        // Здесь вы можете использовать бота и обрабатывать запросы
        // Например, bot.sendMessage(chatId, 'Привет из контроллера!');
        res.send({ message: 'Bot starting' });
      }
    
    
      // Другие методы контроллера
}













module.exports = new botController()