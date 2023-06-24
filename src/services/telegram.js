const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const TOKEN = '5837320122:AAFlPfO8JfEDStPQMxn5V1GHSNKJ16GHfSc'

const bot = new TelegramBot(TOKEN, { polling: true });

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

bot.onText(/Создать мерчанта/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Введите имя мерчанта:');
    bot.once('message', async (msg) => {
      const merchantName = msg.text;
      await createMerchant(chatId, merchantName);
      bot.sendMessage(chatId, `Мерчант "${merchantName}" успешно создан.`);
      showMainMenu(chatId);
    });
});

bot.onText(/Удалить мерчанта/, async (msg) => {
    const chatId = msg.chat.id;
    const merchants = await getMerchants(chatId);
  
    if (merchants.length === 0) {
      bot.sendMessage(chatId, 'У вас еще нет созданных мерчантов.');
      showMainMenu(chatId);
      return;
    }
  
    const keyboard = merchants.map((merchant) => [{ text: merchant }]);
    const options = {
      reply_markup: {
        keyboard,
        one_time_keyboard: true,
      },
    };
  
    bot.sendMessage(chatId, 'Выберите мерчанта для удаления:', options);
    bot.once('message', async (msg) => {
      const merchantName = msg.text;
      await deleteMerchant(chatId, merchantName);
      bot.sendMessage(chatId, `Мерчант "${merchantName}" успешно удален.`);
      showMainMenu(chatId);
    });
  });
module.exports = bot;
