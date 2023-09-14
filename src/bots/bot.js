// bot.js
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  const userExists = await checkIfUserExists(userId);
  if (!userExists) {
    bot.sendMessage(chatId, 'Добро пожаловать! Для регистрации введите следующие данные:');
    bot.sendMessage(chatId, 'Введите ваше полное имя:');
    bot.once('message', async (msg) => {
      const fullName = msg.text;
      bot.sendMessage(chatId, 'Введите название вашей компании:');
      bot.once('message', async (msg) => {
        const companyName = msg.text;
        bot.sendMessage(chatId, 'Введите ваш номер телефона:');
        bot.once('message', async (msg) => {
          const phoneNumber = msg.text;
          await createUser(userId, chatId, fullName, companyName, phoneNumber);
          bot.sendMessage(chatId, `Регистрация успешно завершена, ${fullName}!`);
          showMainMenu(chatId);
        });
      });
    });
  } else {
    bot.sendMessage(chatId, `Привет, @${username}! Добро пожаловать обратно.`);
    showMainMenu(chatId);
  }
});

// Добавьте другие обработчики и функции бота
// ...

module.exports = bot;
