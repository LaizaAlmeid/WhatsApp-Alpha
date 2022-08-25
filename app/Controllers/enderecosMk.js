//const Caixas = require("../Models/table_caixas");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Enderecos = require("../Models/table_enderecos_omega");
var axios = require("axios");

class EnderecosController {
    async index(req, res) {
        const {endereco , empresa} = req.body.result;
         console.log(`JSON endereco:${endereco}`);
//------------------1
        if (endereco!="") {
            const enderecos = await Enderecos.findAll({
                where: {
                    endereco_c: { [Op.like]: `%${endereco}%` },
                    empresa: empresa
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
