// routes.js

const express = require('express');
const router = express.Router();
const { checkIfUserExists, createUser, createMerchant, deleteMerchant, getMerchants } = require('./dbfunctions.js');

router.post('/', async (req, res) => {
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

router.get('/merchants', async (req, res) => {
  // Обработчик GET-запроса
});

module.exports = router;
