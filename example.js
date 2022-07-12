const { Client, Location, List, Buttons, LocalAuth } = require("./index");

var QRCode = require("qrcode");

const axios = require("axios");
var code_qr;
var ok = 0;

const ejs = require("ejs");
const path = require("path");

const client = new Client({
    authStrategy: new LocalAuth(),
    //puppeteer: { headless: false }
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process", // <- this one doesn't works in Windows
            "--disable-gpu",
        ],
    },
});

//VARIAVEL GLOBAL PARA ARMAZENAR AS MENSAGENS RECEBIDAS
var msgRecebida;
//CAPTA O NUMERO DO REMETENTE DO 'RECEIVE'
var from;
//STATUS 1-ENVIADA/2-RECEBIDA/3-LIDA

client.initialize();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
//autenticacao
const LoginController = require("./app/Controllers/LoginController");
const AuthMidleware = require("./app/Midlewares/AuthMidleware");
const { url } = require("inspector");
//
const app = express();

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

//ROTAS------------------------------------------------
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("express started at http://localhost:3000");
});

//Mostra a última mensagem recebida
app.get("/ver", (req, res, next) => {
    if (ok == 1) {
        QRCode.toDataURL(code_qr, (err, src) => {
            res.render("index", {
                qr_code: src,
            });
        });
    } else {
        res.send(
            "Aguarde enquanto o qrcode é gerado...Atualize a página em alguns segundos!"
        );
    }
    //res.render("index");
});
app.get("/MensagemRecebida", AuthMidleware, (req, res) => {
    return res.json(msgRecebida);
});
app.post("/EnviarMensagem", AuthMidleware, (req, res) => {
    var texto = req.body;

    //CASO NAO EXISTA UM BODY RETORNA ERRO 400
    if (!req.body) return res.status(400).end();

    client.sendMessage(
        texto.result.ParaNumero + "@c.us",
        texto.result.mensagem
    );
    console.log('A mensagem: "' + texto.result.mensagem + '" foi enviada');
    //RESPONDE A PROPRIA MENSAGEM
    return res.status(200).json({
        result: {
            mensag: texto.result.mensagem,
            para: texto.result.ParaNumero,
        },
    });
    //return res.json(texto.result.mensagem)
});

app.post("/login", LoginController.index);

//---------------------------------------------------FECHA_ROTAS
//API ALPHA - FUTURA ATUALIZACAO ENVIAR O NOME DO USUARIO WPP
async function post_env_alpha() {
    try {
        const mensagembody = { mensagemB: msgRecebida, De_Cliente: from };
        //const response = await axios.post('https://sistema-alpha.com.br/version-test/api/1.1/wf/ReceberMensagem/initialize', mensagembody)
        const response = await axios.post("https://sistema-alpha.com.br/version-test/api/1.1/wf/ReceberMensagem", mensagembody );
        console.log(response.message);
    } catch (error) {
        console.log(error);
    }
}
var msg_att
var stt_att

async function post_att_alpha() {
    try {
        const mensagembody_att = { mensagem_att : msg_att, De_Cliente : from , stts : stt_att };
        //const response = await axios.post("https://sistema-alpha.bubbleapps.io/version-test/api/1.1/wf/AtualizaMensagem",mensagembody_att);
        const response = await axios.post('https://sistema-alpha.bubbleapps.io/version-test/api/1.1/wf/atualizamensagem/', mensagembody_att);
        console.log(response.message);
    } catch (error) {
        console.log(error);
    }
}
//---------------------------------------------------FECHA_API

client.on("qr", (qr) => {
    //NOTA: Este evento não será acionado se uma sessão for especificada.
    console.log("QR RECEIVED", qr);
    code_qr = qr;
    ok = 1;
    QRCode.toString(qr, { type: "terminal", small: 1 }, function (err, url) {
        console.log(url);
    });
});

client.on("authenticated", () => {
    console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
    console.log("READY");
});

client.on("message", async (msg) => {
    console.log("MESSAGE RECEIVED", msg);

    //RECEBE AS INFORMACOES DE MENSAGEM DO WPP
    msgRecebida = msg.body;
    //EDITA O NUMERO RECEBIDO
    let text = msg.from;
    from = text.substring(0, 12);

    //CHAMA O ENDPOINT(API WORKFLOW) DO ALPHA
    post_env_alpha();

    if (msg.body === "ola") {
        // Send a new message as a reply to the current one
        post_env_alpha();

        //responde com
        msg.reply("Olá! Mensagem recebida");
    }
});

//cliente on message_ack

client.on("message_create", (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
});

client.on("message_revoke_everyone", async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log(after); // message after it was deleted.
    if (before) {
        console.log(before); // message before it was deleted.
    }
});

client.on("message_revoke_me", async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    console.log(msg.body); // message before it was deleted.
});

//Status de mensagem
client.on("message_ack", (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1 - enviada
        ACK_DEVICE: 2- recebida
        ACK_READ: 3 - lida
        ACK_PLAYED: 4
    */
    let text = msg.from;
    from = text.substring(0, 12);
    msg_att= msg.body
    stt_att= ack.toString

    if (ack == 1) {
        // A MENSAGEM É ENVIADA
        stt_att= "1"
        post_att_alpha();

        console.log("enviada:: msg: " + msg.body);
        console.log("enviada:: num: " + from);
        console.log("enviada:: status: " + ack);

        console.log("ENVIADA : " + msg.body);
    }
    if (ack == 2) {
        // A MENSAGEM É RECEBIDA
        stt_att= "2"
        post_att_alpha();

        console.log("enviada:: msg: " + msg.body);
        console.log("enviada:: num: " + from);
        console.log("enviada:: status: " + ack);

        console.log("RECEBIDA : " + msg.body);
    }
    if (ack == 3) {
        // A MENSAGEM É LIDA
        stt_att= "3"
        post_att_alpha();

        console.log("enviada:: msg: " + msg.body);
        console.log("enviada:: num: " + from);
        console.log("enviada:: status: " + ack);

        console.log("LIDA : " + msg.body);
    }
});

client.on("group_join", (notification) => {
    // User has joined or been added to the group.
    console.log("join", notification);
    notification.reply("User joined.");
});

client.on("group_leave", (notification) => {
    // User has left or been kicked from the group.
    console.log("leave", notification);
    notification.reply("User left.");
});

client.on("group_update", (notification) => {
    // Group picture, subject or description has been updated.
    console.log("update", notification);
});

client.on("change_state", (state) => {
    console.log("CHANGE STATE", state);
});

client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
});
