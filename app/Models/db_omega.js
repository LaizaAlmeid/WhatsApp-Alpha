const Sequelize = require('sequelize')

const sequelize = new Sequelize ('u936722494_DB_Omega','u936722494_alpha','Alpha@123', {
    host: 'sql540.main-hosting.eu',
    dialect: 'mysql'
});

//VERIFICA SE A CONEXAO FOI BEM SUCEDIDA
sequelize.authenticate()
.then(() =>{
    console.log("SUCESSO: CONEXAO COM SUCESSO =)")

}).catch(()=>{
    console.log("ERRO: CONEXAO SEM SUCESSO")
})

module.exports = sequelize;