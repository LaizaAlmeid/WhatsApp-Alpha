const Sequelize = require("sequelize");
const db = require("./db_omega_vps");

const Enderecos = db.define("omieLig10_enderecos", {
    // Model attributes are defined here
    logradouro: {
        type: Sequelize.STRING,
        required: true,
    },
    cd_logradouro: {
        type: Sequelize.STRING,
        required: true,
        // allowNull defaults to true
    },
    bairro: {
        type: Sequelize.STRING,
        required: true,
        // allowNull defaults to true
    },
    cd_bairro: {
        type: Sequelize.STRING,
        required: true,
        // allowNull defaults to true
    },
    cidade: {
        type: Sequelize.STRING,
        required: true,
        // allowNull defaults to true
    },
    cd_cidade: {
        type: Sequelize.STRING,
        required: true,
        // allowNull defaults to true
    },
    cd_uf: {
        type: Sequelize.STRING,
        required: true,
        // allowNull defaults to true
    },
    siglaestado: {
        type: Sequelize.STRING,
        required: true,
        // allowNull defaults to true
    },
});

//comando para criar tabela no bd caso n exista user.sync(); / user.sync({alter: true }) / user.sync({force: true});;
Enderecos.sync();

module.exports = Enderecos;
