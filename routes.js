const { Router } = require('express')
const LoginController = require('./app/Controllers/LoginController')

//const UserController = require('./app/Controllers/UserController')

const routes = new Router()

routes.post("/login", LoginController.index)

module.exports = routes