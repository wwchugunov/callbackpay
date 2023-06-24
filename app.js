const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');
require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();
const port = 3000;
app.use(cors());

app.use(express.json());

app.post('/', (req, res) => {
  console.log('Received POST request');
  console.log('Request body:', req.body);
  const data = req.body;
  const { merchant_id } = req.body;

  // Находим чат-идентификаторы по мерчанту
  const query = 'SELECT chat_id FROM users WHERE merchants @> ARRAY[$1]::TEXT[]';
  const values = [merchant_id];
  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Error retrieving chat_ids:', error);
      return;
    }

    const rows = result.rows;
    if (rows.length === 0) {
      console.log('No matching chat_ids found for merchantId:', merchant_id);
      return;
    }

    rows.forEach(row => {
      const chatId = row.chat_id;

      let message = `<b>Оплата</b>\n`;
      if (req.body.order_status === 'approved') {
        message += `<b>Статус</b><b>   Успешно ✅</b>\n`;
      } else if (req.body.order_status === 'processing') {
        message += `<b>Статус</b><b>   В обработке 🔴</b>\n`;
      } else if (req.body.response_status === 'Loading') {
        message += `<b>Статус</b><b>   Операция в обработке</b>\n`;
      } else if (req.body.response_status === '404') {
        message += `<b>Статус</b><b>   Нет ответа от сервера попробуйте позже</b>\n`;
      }

      const merchant_data = JSON.parse(req.body.merchant_data);
      merchant_data.forEach(item => {
        const value = item.value;
        message += `${item.label}  ${value}\n`;
      });

      message += `<b>Код ответа</b> ${req.body.response_code}\n`;
      message += `<b>Метод оплаты</b> ${req.body.payment_system}\n`;

      // Преобразование суммы в десятичную
      let totalAmount = req.body.amount / 100;
      message += `<b>Сумма</b> ${totalAmount} <b>грн</b> \n`;

      message += `<b>Дата</b> <b>${req.body.order_time}</b>\n`;
      message += `<b>id платежа</b> ${req.body.order_id}\n`;
      message += `<b>Валюта</b> ${req.body.currency}\n`;
      message += `<b>Почта</b> ${req.body.sender_email}\n`;

      // Отправляем колбек каждому найденному чату
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    });
  });

  res.sendStatus(200);
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
});

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

async function checkIfUserExists(userId) {
  const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)';
  const values = [userId];
  const result = await pool.query(query, values);
  return result.rows[0].exists;
}

async function createUser(userId, chatId, fullName, companyName, phoneNumber) {
  const query = 'INSERT INTO users (id, chat_id, company_name, phone_number, full_name) VALUES ($1, $2, $3, $4, $5)';
  const values = [userId, chatId, companyName, phoneNumber, fullName];
  await pool.query(query, values);
}

async function createMerchant(chatId, merchantName) {
  const query = 'UPDATE users SET merchants = array_append(merchants, $1) WHERE chat_id = $2';
  const values = [merchantName, chatId];
  await pool.query(query, values);
}

async function deleteMerchant(chatId, merchantName) {
  const query = 'UPDATE users SET merchants = array_remove(merchants, $1::text) WHERE chat_id = $2';
  const values = [merchantName, chatId];
  await pool.query(query, values);
}

async function getMerchants(chatId) {
  const query = 'SELECT merchants FROM users WHERE chat_id = $1';
  const values = [chatId];
  const result = await pool.query(query, values);

  if (result.rows.length > 0) {
    try {
      const merchantsArray = result.rows[0].merchants || [];
      console.log('Merchants:', merchantsArray); 
      const merchantNames = merchantsArray.join('\n');
      console.log('Merchant Names:', merchantNames); 

      return merchantsArray;
    } catch (error) {
      console.error('Error parsing merchants:', error);
      return [];
    }
  } else {
    return [];
  }
}

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

function showMainMenu(chatId) {
  const keyboard = [['Создать мерчанта', 'Удалить мерчанта'], ['Все мерчанты'], ['Назад']];
  const options = {
    reply_markup: {
      keyboard,
      one_time_keyboard: true,
    },
  };

  bot.sendMessage(chatId, '======', options);
}

app.get('/merchants', async (req, res) => {
  try {
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    const users = result.rows;
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});