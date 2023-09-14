const TelegramBot = require('node-telegram-bot-api');
const { checkIfUserExists, createUser, createMerchant, deleteMerchant, getMerchants } = require('./database');
require('dotenv').config();

// Создаем объект бота
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Обработчик команды /start
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

// Обработчик команды "Создать мерчанта"
bot.onText(/Создать мерчанта/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Введите имя мерчанта:');

  bot.once('message', async (msg) => {
    const merchantName = msg.text;

    if (!merchantName) {
      bot.sendMessage(chatId, 'Имя мерчанта не может быть пустым.');
      return;
    }

    if (!/^\d+$/.test(merchantName)) {
      bot.sendMessage(chatId, 'Имя мерчанта должно содержать только цифры.');
      return;
    }

    await createMerchant(chatId, merchantName);
    bot.sendMessage(chatId, `Мерчант "${merchantName}" успешно создан.`);
    showMainMenu(chatId);
  });
});

// Обработчик команды "Удалить мерчанта"
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

// Функция для отображения главного меню
function showMainMenu(chatId) {
  const keyboard = [['Создать мерчанта', 'Удалить мерчанта'], ['Все мерчанты'], ['Назад']];
  const options = {
    reply_markup: {
      keyboard,
      one_time_keyboard: true,
    },
  };
  bot.sendMessage(chatId, 'Выберите действие', options);
}

// Обработчик команды "Все мерчанты"
bot.onText(/Все мерчанты/, async (msg) => {
  const chatId = msg.chat.id;
  const merchants = await getMerchants(chatId);

  if (merchants.length === 0) {
    bot.sendMessage(chatId, 'У вас еще нет созданных мерчантов.');
  } else {
    const merchantNames = merchants.join('\n');
    bot.sendMessage(chatId, `Ваши мерчанты:\n${merchantNames}`);
  }
  showMainMenu(chatId);
});

module.exports = bot;
