const { Client, Location, List, Buttons, LocalAuth} = require('./index');

var QRCode = require('qrcode')

const axios = require("axios");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
});

//VARIAVEL GLOBAL PARA ARMAZENAR AS MENSAGENS RECEBIDAS
var msgRecebida 
//CAPTA O NUMERO DO REMETENTE DO 'RECEIVE'
var from

client.initialize();

const express= require('express')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser');
//autenticacao
const LoginController = require('./app/Controllers/LoginController');
const AuthMidleware = require('./app/Midlewares/AuthMidleware');
//
const app = express()

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())

//ROTAS------------------------------------------------
const port = process.env.PORT || 3000;
app.listen(port, () =>{
    console.log('express started at http://localhost:3000')
})

//Mostra a última mensagem recebida
app.get('/MensagemRecebida', AuthMidleware , (req, res)=> {
    return res.json(msgRecebida) 
})
app.post('/EnviarMensagem' , AuthMidleware , (req, res) => {
    var texto = req.body

    //CASO NAO EXISTA UM BODY RETORNA ERRO 400
    if(!req.body)
    return res.status(400).end()    

    client.sendMessage(texto.result.ParaNumero+"@c.us", texto.result.mensagem);
    console.log('A mensagem: "' + texto.result.mensagem +'" foi enviada')
    //RESPONDE A PROPRIA MENSAGEM
    return res.json(texto.result.mensagem) 
})

app.post('/login', LoginController.index)

//---------------------------------------------------FECHA_ROTAS
//API ALPHA
async function post_alpha(){
    try {
     const mensagembody = {  mensagemB: msgRecebida, De: from}
     const response = await axios.post('https://sitema-alpha-provedornet.bubbleapps.io/version-test/api/1.1/wf/apiwpp', mensagembody)
     //return res.json(msgRecebida) 
     console.log(response.message)
 
    } catch (error) {
     console.log(error);
    }
 }
//---------------------------------------------------FECHA_API

client.on('qr', (qr) => {
    //NOTA: Este evento não será acionado se uma sessão for especificada.
    console.log('QR RECEIVED', qr);
    QRCode.toString(qr,{type:'terminal', small: 1 }, function (err, url) {
        console.log(url)
      })
    
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});



client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);
   
    //RECEBE AS INFORMACOES DE MENSAGEM DO WPP
    msgRecebida = msg.body
    from = msg.from

    //CHAMA O ENDPOINT(API WORKFLOW) DO ALPHA
    post_alpha()

    if (msg.body === 'ola') {
        // Send a new message as a reply to the current one
        post_alpha()

        //responde com
        msg.reply('Olá! Mensagem recebida');

    }
});

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log(after); // message after it was deleted.
    if (before) {
        console.log(before); // message before it was deleted.
    }
});

client.on('message_revoke_me', async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    console.log(msg.body); // message before it was deleted.
});

client.on('message_ack', (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if(ack == 3) {
        // The message was read
    }
});

client.on('group_join', (notification) => {
    // User has joined or been added to the group.
    console.log('join', notification);
    notification.reply('User joined.');
});

client.on('group_leave', (notification) => {
    // User has left or been kicked from the group.
    console.log('leave', notification);
    notification.reply('User left.');
});

client.on('group_update', (notification) => {
    // Group picture, subject or description has been updated.
    console.log('update', notification);
});

client.on('change_state', state => {
    console.log('CHANGE STATE', state );
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

