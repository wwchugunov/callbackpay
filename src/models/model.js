const sequelize = require('../../db')
const {Sequelize, DataTypes} = require('sequelize')

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  chat_id: { type: DataTypes.BIGINT, unique: true },
  company_name: DataTypes.STRING,
  phone_number: DataTypes.STRING,
  full_name: DataTypes.STRING,
  merchants: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
});

module.exports = User;
