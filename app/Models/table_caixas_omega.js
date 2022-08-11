const Sequelize = require('sequelize');
const db = require('./db_omega')

const Caixas = db.define('caixas_alpha', {
    // Model attributes are defined here
    _id: {
        type: Sequelize.STRING,
        required: true
      },
    descricao: {
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
    endereco: {
        type: Sequelize.STRING,
        required: true
        // allowNull defaults to true
    },
    empresa: {
        type: Sequelize.STRING,
        required: true
        // allowNull defaults to true
    },
    bairro: {
        type: Sequelize.STRING,
        required: true
        // allowNull defaults to true
    },
    numero: {
        type: Sequelize.STRING,
        required: true
        // allowNull defaults to true
    },
    cep: {
        type: Sequelize.STRING,
        required: true
        // allowNull defaults to true
    }
  });

//comando para criar tabela no bd caso n exista user.sync(); / user.sync({alter: true }) / user.sync({force: true});;
      Caixas.sync({force: true});
 
module.exports = Caixas