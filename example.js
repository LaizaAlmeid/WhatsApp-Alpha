const { Client,Location,List,Buttons, MessageMedia,LocalAuth,} = require("./index");

var QRCode = require("qrcode");

const axios = require("axios");
var code_qr;
var readyAlpha;
var ok = 0;

const ejs = require("ejs");
const path = require("path");

//NAVEGADOR

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

//O código abaixo ativa o sistema de multi-sessoes entretanto devem ser criadas funcoes para os dois; ao inves de apenas por ex: client.on

// const client = new Client({
//     authStrategy: new LocalAuth({ clientId: "client-one" }),
// });

// const client2 = new Client({
//     authStrategy: new LocalAuth({ clientId: "client-two" }),
// });

var id_msg;
//VARIAVEL GLOBAL PARA ARMAZENAR AS MENSAGENS RECEBIDAS
var msgRecebida;
//CAPTA O NUMERO DO REMETENTE DO 'RECEIVE'
var from;
//STATUS 1-ENVIADA/2-RECEBIDA/3-LIDA
var media_recebida_img
var media_recebida_pdf


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
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log("express started at http://localhost:3001");
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

//const media = MessageMedia.fromFilePath('./app/img/nopicture.png');

app.post("/EnviarMensagem", AuthMidleware, (req, res) => {
    var texto = req.body;
    var FoneEdit1;
    var FoneEdit2;

    //CASO NAO EXISTA UM BODY RETORNA ERRO 400
    if (!req.body) return res.status(400).end();

    let length = texto.result.ParaNumero.length;
    const base64Image = texto.result.img;
    const base64Pdf = texto.result.pdf;

//VERIFICA A VALIDADE DO NUMERO E FORMATA
    if (length == 16) {
        let Fone = texto.result.ParaNumero;
        FoneEdit1 = Fone.substring(7, 11);
        FoneEdit2 = Fone.substring(12, 16);

//MENSAGEM SIMPLES
        if (base64Image.length <= 0 && base64Pdf.length <= 0) {
            client.sendMessage(
                "5585" + FoneEdit1 + FoneEdit2 + "@c.us",
                texto.result.mensagem
            );
        }
//MENSAGEM & IMAGEM
        if (base64Image.length > 0) {
            var receivedImg
            const mediaImg = new MessageMedia("image/png", base64Image);

            client.sendMessage(
                "5585" + FoneEdit1 + FoneEdit2 + "@c.us",
                mediaImg,
                { caption: texto.result.mensagem }
            );
            receivedImg = 1
        }
//MENSAGEM PDF
        if (base64Pdf.length > 0) {
            var receivedPdf 
            const mediaPdf = new MessageMedia("application/pdf", base64Pdf);

            client.sendMessage(
                "5585" + FoneEdit1 + FoneEdit2 + "@c.us",
                mediaPdf
            );
            receivedPdf = 1
        }
    }
    //NUMERO INVÁLIDO
    if (length != 16) {
        return res.status(200).json({
            result: {
                mensag: "null",
                para: "null",
            },
        });
    }

    // client.sendMessage(
    //     texto.result.ParaNumero + "@c.us",
    //     texto.result.mensagem
    // );

    console.log('A mensagem "' + texto.result.mensagem + '" foi enviada para 5585' + FoneEdit1 + FoneEdit2 );
    //RESPONDE A PROPRIA MENSAGEM
    return res.status(200).json({
        result: {
            mensagem: texto.result.mensagem,
            para: texto.result.ParaNumero,
            img: receivedImg,
            pdf: receivedPdf,
        },
    });
    //return res.json(texto.result.mensagem)
});

app.post("/login", LoginController.index);

//---------------------------------------------------FECHA_ROTAS
//API ALPHA - FUTURA ATUALIZACAO ENVIAR O NOME DO USUARIO WPP
async function post_env_alpha() {
    try {
        var FoneEd1;
        var FoneEd2;
        let Fone = from;
        FoneEd1 = Fone.substring(4, 8);
        FoneEd2 = Fone.substring(8, 12);

        const mensagembody = {
            mensagemB: msgRecebida,
            De_Cliente: "(85) 9 " + FoneEd1 + "-" + FoneEd2,
            id_msg: id_msg,
            img: media_recebida_img,
            pdf: media_recebida_pdf,          
        };
        //const response = await axios.post('https://sistema-alpha.com.br/version-test/api/1.1/wf/ReceberMensagem/initialize', mensagembody)
        const response = await axios.post(
            "https://sistema-alpha.com.br/version-test/api/1.1/wf/ReceberMensagem",
            mensagembody
        );
        //STATUS 200
        console.log(response.status);
    } catch (error) {
        console.log(error);
    }
}
//-------------------------------------------------------------
var msg_att;
var stt_att;

async function post_att_alpha() {
    try {
        var FoneEd1;
        var FoneEd2;
        let Fone = from;
        FoneEd1 = Fone.substring(4, 8);
        FoneEd2 = Fone.substring(8, 12);
        const mensagembody_att = {
            mensagem_att: msg_att,
            De_Cliente: "(85) 9 " + FoneEd1 + "-" + FoneEd2,
            stts: stt_att,
            id_msg: id_msg,
        };
        //const response = await axios.post("https://sistema-alpha.bubbleapps.io/version-test/api/1.1/wf/atualizarmsg/initialize",mensagembody_att);
        const response = await axios.post(
            "https://sistema-alpha.com.br/version-test/api/1.1/wf/atualizarMsg",
            mensagembody_att
        );
        console.log(response.status);
        //await delay(1000)
    } catch (error) {
        console.log(error);
    }
}
//------------------ bubble qr code 
async function post_qr_alpha() {
    try {
              
        const mensagembody_att = {
            qrcode: code_qr,
            ready: readyAlpha,
           
        };
        //const response = await axios.post("https://sistema-alpha.bubbleapps.io/version-test/api/1.1/wf/atualizarmsg/initialize",mensagembody_att);
        const response = await axios.post(
            "https://sistema-alpha.com.br/version-test/api/1.1/wf/atualizarQR",
            mensagembody_att
        );
        console.log(response.status);
        //await delay(1000)
    } catch (error) {
        console.log(error);
    }
}


//-------------------------------------------------------------
//MANDAR PARA FATURAS BUBBLE

//---------------------------------------------------FECHA_API

client.on("qr", (qr) => {
    //NOTA: Este evento não será acionado se uma sessão for especificada.
    console.log("QR RECEIVED", qr);
    code_qr = qr;
    ok = 1;
    QRCode.toString(qr, { type: "terminal", small: 1 }, function (err, url) {
        console.log(url);
    });
    post_qr_alpha()
});

client.on("authenticated", () => {
    console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
    readyAlpha="1";
    console.log("READY");
    post_qr_alpha()
});

client.on("message", async (msg) => {
    console.log("MESSAGE RECEIVED", msg);

    id_msg = msg.id.id;
    console.log(msg.id.id);
    //RECEBE AS INFORMACOES DE MENSAGEM DO WPP
    msgRecebida = msg.body;
    //EDITA O NUMERO RECEBIDO
    let text = msg.from;
    from = text.substring(0, 12);
    
    media_recebida_img='0';
    media_recebida_pdf='0';

    if(msg.hasMedia) {
        const media = await msg.downloadMedia();
        if(msg.type=='image'){
        media_recebida_pdf='0';
        media_recebida_img= media.data;
        }if(msg.type=='document'){
        media_recebida_img='0';
        media_recebida_pdf= media.data;
        }
}
    //CHAMA O ENDPOINT(API WORKFLOW) DO ALPHA
    post_env_alpha();

    // if (msg.body === "ola") {
    //     // Send a new message as a reply to the current one
    //     post_env_alpha();

    //     //responde com
    //     msg.reply("Olá! Mensagem recebida");
    // }
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
    msg_att = msg.body;
    id_msg = msg.id.id;

    console.log("enviada:: msg: " + msg.body);
    console.log("enviada:: num: " + from);
    console.log("enviada:: status: " + ack);
    console.log("id:::::  " + msg.id.id);

    if (ack == 1) {
        // A MENSAGEM É ENVIADA
        stt_att = "1";
        console.log("ENVIADA ack: " + msg.body);
        //post_att_alpha();
    }
    if (ack == 2) {
        // A MENSAGEM É RECEBIDA
        stt_att = "2";
        console.log("RECEBIDA ack: " + msg.body);
        setTimeout(post_att_alpha(), 1000);
    }
    if (ack == 3) {
        // A MENSAGEM É LIDA
        stt_att = "3";
        console.log("LIDA ack: " + msg.body);
        setTimeout(post_att_alpha(), 1000);
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
    readyAlpha='0'
    post_qr_alpha()
    console.log("Client was logged out", reason);
});
