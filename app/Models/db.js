const Sequelize = require('sequelize')

const sequelize = new Sequelize ('u936722494_DB_Omega','u936722494_alpha','Alpha@123', {
    host: 'sql540.main-hosting.eu',
    dialect: 'mysql'
});

//VERIFICA SE A CONEXAO FOI BEM SUCEDIDA
// sequelize.authenticate()
// .then(() =>{
//     console.log("SUCESSO: CONEXAO COM SUCESSO =)")

// }).catch(()=>{
//     console.log("ERRO: CONEXAO SEM SUCESSO")
// })

// const sequelize2 = new Sequelize ('ixcprovedor','leitura','nMLQxnu9Dv1R2JFA1ZGw#F$XI@5Jj5BL', {
//     host: '45.224.130.108',
//     dialect: 'mariadb'
// });

// //VERIFICA SE A CONEXAO FOI BEM SUCEDIDA
// sequelize2.authenticate()
// .then(() =>{
//     console.log("SUCESSO: CONEXAO COM SUCESSO maria db ixc provedor =)")

// }).catch(()=>{
//     console.log("erro: CONEXAO sem SUCESSO maria db ixc provedor =( )")
// })


module.exports = sequelize;
