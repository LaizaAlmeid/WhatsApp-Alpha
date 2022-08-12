//const Caixas = require("../Models/table_caixas");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Caixas = require("../Models/table_caixas_omega");
var axios = require("axios");


class ViabilidadeController {
    async index(req, res) {
        const { latitude, longitude, empresa } = req.body.result;
        //Tenta reduzir o numero de linhas da busca
        var latAprox = latitude.substring(0, 5);
        var lonAprox = longitude.substring(0, 5);

        const caixas = await Caixas.findAll({
            where: {
              empresa: empresa,
              latitude:{ [Op.like]: '%' +latAprox +'%' } ,
              longitude:{ [Op.like]: '%' +lonAprox +'%' }
            }
          });

        // console.log(caixas(---const---).every((caixas_alpha(---tabela---)) => caixas_alpha(---tabela---) instanceof Caixas(---const require---))); // TRUE
        console.log(caixas.every((caixas_alpha) => caixas_alpha instanceof Caixas)); // TRUE
        // console.log("ALL CAIXAS:", JSON.stringify(caixas, null, 2));
        console.log("----------------------------------------------------");
        console.log("TAMANHO DA TABELA:   " + caixas.length);
        console.log("----------------------------------------------------");

        var cliCoord = latitude+","+longitude;
        var cxDistancia = 0;
        var cxDistanciaMaps = 0;
        var cxNome = "VAZIO";
        var cxCoord = ""
        var LatCX_selected = ""
        var LonCX_selected = ""
        var viabilidadeStatus = "FALSE"
        
        for (var i = 0; i < caixas.length; i++) {
            
        // console.log(i);
        // console.log(caixas[i].getDataValue("descricao"));

        var LatCxs = caixas[i].getDataValue("latitude");
        var LonCxs = caixas[i].getDataValue("longitude");
          
        const raio = 6371e3;

        const rad1 = (latitude * Math.PI) / 180;
        var rad2 = (LatCxs * Math.PI) / 180;

        var difLat = ((LatCxs - latitude) * Math.PI) / 180;
        var difLon = ((LonCxs - longitude) * Math.PI) / 180;

        var x = Math.sin(difLat / 2) * Math.sin(difLat / 2) +
        Math.cos(rad1) * Math.cos(rad2) * Math.sin(difLon / 2) * Math.sin(difLon / 2);

        var y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
        var resDistancia = (raio * y).toFixed(); //EM METROS

        var distanciaEmKm = resDistancia / 1000;
        // console.log(distanciaEmKm + " Km");
        // console.log("----------------------------------------------------")
        // console.log("DISTANCIA:  " + resDistancia + "m");
        // console.log("cxDistancia: "+ cxDistancia + "m");
        
        //    300m media de distancia permitida
        if ((cxDistancia == 0) & (0 < resDistancia < 300) & i==0) {
            console.log("-----if1-----");
            
            cxNome = caixas[i].getDataValue("descricao");
            cxDistancia = resDistancia;
            LatCX_selected = LatCxs;
            LonCX_selected = LonCxs;
            cxCoord = LatCxs+","+LonCxs;
            viabilidadeStatus = "TRUE";
            
            console.log("cxDistancia atualizada: "+ cxDistancia + "m");

        }
        if (cxDistancia > parseInt(resDistancia) & 300 > parseInt(resDistancia)) {
            console.log("-----if2-----");
            cxNome = caixas[i].getDataValue("descricao");
            cxDistancia = resDistancia;
            LatCX_selected = LatCxs;
            LonCX_selected = LonCxs;
            cxCoord = LatCxs+","+LonCxs;
            viabilidadeStatus = "TRUE";
            console.log("cxDistancia atualizada: "+ cxDistancia + "m");
        }
        // console.log("----------------------------------------------------");
        } 
        //FIM DO LOOP
        // ////// API GOOGLE
        var config = {
            method: "get",
            url: "https://maps.googleapis.com/maps/api/directions/json?origin="+cliCoord+"&destination="+cxCoord+"&mode=walking&key=AIzaSyC-LLiFh2rzmVQYTnHzizG1nI3VsJBNRkM",
            headers: {},
        };

        axios(config)
            .then(function (response) {
                const distance = response.data.routes[0].legs[0].distance;
                console.log("DISTANCIA MÍNIMA É: " + distance.text+ "  //  "+ distance.value +"m");
                //RECEBENDO A DISTANCIA DA CAIXA COM BASE NA ROTA GOOGLE
                // console.log(cxDistancia);

                cxDistanciaMaps = distance.value;
                console.log("CAIXA ESCOLHIDA:" + cxNome);
        
                console.log("REQUISIÇÃO CONCLUIDA");
                return res.status(200).json({
                    statusV: viabilidadeStatus,
                    caixa: cxNome,
                    latCli:latitude,
                    lonCli:longitude,
                    latCX:LatCX_selected,
                    lonCX:LonCX_selected,
                    distRow_m: cxDistancia,
                    distMaps_m: cxDistanciaMaps
                });

            })
            .catch(function (error) {
                console.log(error);
            });
        ///////
      
    }
}

module.exports = new ViabilidadeController();
