//const Caixas = require("../Models/table_caixas");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Enderecos = require("../Models/table_enderecos_omega");
var axios = require("axios");

class EnderecosController {
    async index(req, res) {
        const { logradouro, bairro, cidade } = req.body.result;
        console.log(`JSON logradouro:${logradouro}`);
//------------------1
        if (
            (logradouro != "" && bairro == "" && cidade == "") ||
            (bairro != "" && cidade == "" && logradouro == "") ||
            (cidade != "" && bairro == "" && logradouro == "")
        ) {
            const enderecos = await Enderecos.findAll({
                where: {
                    [Op.or]: [
                        { logradouro: logradouro },
                        { cidade: cidade },
                        { bairro: bairro },
                    ],
                },
            });
            if (enderecos.length > 0) {
                console.log(`FORAM ENCONTRADOS ${enderecos.length} RESULTADOS`);
                console.log(JSON.stringify(enderecos, null, 2));
                const jsonenderecos = JSON.stringify(enderecos, null, 2);
                res.send(JSON.parse(jsonenderecos));
            }else{
                return res.status(200).json({
                    status: "Endereço não encontrado",
                    
                });
            }
        }
//----------------------2
        if (
            (logradouro != "" && bairro != "" && cidade == "") ||
            (logradouro != "" && cidade != "" && bairro == "") ||
            (bairro != "" && cidade != "" && logradouro == "")
        ) {
            const enderecos = await Enderecos.findAll({
                where: {
                    [Op.or]: [
                        { logradouro: logradouro, bairro: bairro },
                        { logradouro: logradouro, cidade: cidade },
                        { bairro: bairro, cidade: cidade },
                    ],
                },
            });
            if (enderecos.length > 0) {
                console.log(`FORAM ENCONTRADOS ${enderecos.length} RESULTADOS`);
                console.log(JSON.stringify(enderecos, null, 2));
                const jsonenderecos = JSON.stringify(enderecos, null, 2);
                res.send(JSON.parse(jsonenderecos));
            }else{
                return res.status(200).json({
                    status: "Endereço não encontrado",
                    
                });
            }
        }
//------------------3
        if (bairro != "" && cidade != "" && logradouro != "") {
            const enderecos = await Enderecos.findAll({
                where: {
                    logradouro: logradouro,
                    bairro: bairro,
                    cidade: cidade,
                },
            });
            if (enderecos.length > 0) {
                console.log(`FORAM ENCONTRADOS ${enderecos.length} RESULTADOS`);
                console.log(JSON.stringify(enderecos, null, 2));
                const jsonenderecos = JSON.stringify(enderecos, null, 2);
                res.send(JSON.parse(jsonenderecos));
            }else{
                return res.status(200).json({
                    status: "Endereço não encontrado",
                    
                });
            }
        }
    }
}

module.exports = new EnderecosController();
