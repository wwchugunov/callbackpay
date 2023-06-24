const express = require('express');
require('dotenv').config();
const app = express();
const port = 3000;

const callbackRouter = require('./routes/callback');
const bot = require('./services/telegram');

app.use(express.json());

app.use('/', callbackRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
