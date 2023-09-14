const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
});

module.exports = { pool };


// Прод

const {sequelize, Sequelize} = require('sequelize')
require('dotenv').config()


module.exports = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: 'postgres',
        host: '172.17.14.51',
        port: 5432
    }
)