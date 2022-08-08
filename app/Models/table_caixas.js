const Sequelize = require('sequelize');
const db = require('./db')

const Caixas = db.define('caixas', {
    // Model attributes are defined here
    id: {
      primaryKey: true,
      type: Sequelize.STRING,
      required: true
    },
    caixa: {
        type: Sequelize.STRING,
        required: true
        // allowNull defaults to true
      },
    latitude: {
        type: Sequelize.STRING,
        required: true
        // allowNull defaults to true
    },
    longitude: {
        type: Sequelize.STRING,
        required: true
        // allowNull defaults to true
    },
    rua: {
        type: Sequelize.STRING,
        required: true
        // allowNull defaults to true
    }
  });

//comando para criar tabela no bd caso n exista user.sync(); / user.sync({alter: true }) / user.sync({force: true});;
      Caixas.sync();
 
module.exports = Caixas