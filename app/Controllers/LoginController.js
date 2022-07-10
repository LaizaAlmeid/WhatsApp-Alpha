//const User = require('../Models/User');
//const User = require('../Models/db') 
const User = require('../Models/table_user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/auth');

class LoginController {

  async index(req, res) {
    const { email, password } = req.body;
    const userExist = await User.findOne({ where:{ email: email , password: password}})
    
    // console.log( "email body :::: "+ email)
    // console.log( "senha body :::: "+ password)
    // console.log( "email userExist :::: "+ userExist.email )
    // console.log("senha userExist :::: "+ userExist.password )

    if(!userExist){
      return res.status(400).json({
        error: true,
        message: "Falha na autenticação!"
      })
    }

    // if(!(await bcrypt.compare(password , userExist.password ))) {
    //   return res.status(400).json({
    //     error: true,
    //     message: "A senha está inválida!"
    //   })
    // }
     

    return res.status(200).json({
      user: {
        name: userExist.name,
        email: userExist.email
      },
      token: jwt.sign(
        {id: userExist.id}, 
        config.secret, 
        {expiresIn: config.expireIn} 
      )
    })
  }
}

module.exports = new LoginController();