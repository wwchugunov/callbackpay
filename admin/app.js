const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

const port = 4000;

app.use(express.static('public')); // Папка для статических файлов
app.use(cors());
const pool = new Pool({
  connectionString: 'postgresql://u8802:Qq123456@localhost:5432/botuser',
});

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
  
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
