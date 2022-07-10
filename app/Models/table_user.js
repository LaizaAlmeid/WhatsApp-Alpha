const Sequelize = require('sequelize');
const db = require('./db')

const User = db.define('users', {
    // Model attributes are defined here
    name: {
      type: Sequelize.STRING,
      required: true
    },
    email: {
        type: Sequelize.STRING,
        required: true
        // allowNull defaults to true
      },
    password: {
       type: Sequelize.STRING,
       required: true
       // allowNull defaults to true
    }
  });

//comando para criar tabela no bd caso n exista user.sync(); / user.sync({alter: true }) / user.sync({force: true});;
    User.sync()
 
module.exports = User