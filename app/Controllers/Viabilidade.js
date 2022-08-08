const Caixas = require("../Models/table_caixas");
var axios = require("axios");

class ViabilidadeController {
    async index(req, res) {
        const { latitude, longitude, logradouro } = req.body.result;

        const caixas = await Caixas.findAll();

        console.log(caixas.every((caixas) => caixas instanceof Caixas)); // true
        console.log("ALL CAIXAS:", JSON.stringify(caixas, null, 2));
        console.log("----------------------------------------------------");
        console.log("TAMANHO DA TABELA:   " + caixas.length);
        console.log("----------------------------------------------------");

        var cliCoord = latitude+","+longitude;
        var cxDistancia = 0;
        var cxNome = "VAZIO";
        var cxCoord = ""

        for (var i = 0; i < caixas.length; i++) {
            
          console.log(i);
          console.log(caixas[i].getDataValue("caixa"));

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

          var result;
          result = Number(resDistancia).toLocaleString();
          result = result.replace(/.([^.]*)$/, "," + "$1") + " km";
          // console.log("----------------------------------------------------")
          console.log(result);
          console.log("DISTANCIA:  " + resDistancia + "m");
          console.log("----------------------------------------------------");

          if ((cxDistancia == 0) & (resDistancia > 0)) {
              console.log("-----if1");
              cxNome = caixas[i].getDataValue("caixa");
              cxDistancia = resDistancia;
              cxCoord = LatCxs+","+LonCxs;
          }
          if (cxDistancia > resDistancia) {
              console.log("-----if2");
              cxNome = caixas[i].getDataValue("caixa");
              cxDistancia = resDistancia;
              cxCoord = LatCxs+","+LonCxs;

            }
        } //FIM DO LOOP
        //////
        var config = {
            method: "get",
            url: "https://maps.googleapis.com/maps/api/directions/json?origin="+cliCoord+"&destination="+cxCoord+"&mode=walking&key=AIzaSyC-LLiFh2rzmVQYTnHzizG1nI3VsJBNRkM",
            headers: {},
        };

        axios(config)
            .then(function (response) {
                const teste = response.data.routes[0].legs[0].distance;
                console.log("DISTANCIA MÍNIMA É: " + teste.text+ "  //  "+ teste.value +"m");
                dist= teste.value;
            })
            .catch(function (error) {
                console.log(error);
            });
        //////

        console.log("CAIXA ESCOLHIDA:" + cxNome);

        console.log("SERVICO ATIVO");
        return res.status(200).json({
            caixa: cxNome,
            coordenadascx: cxCoord,
            distancia: dist

        });
    }
}

module.exports = new ViabilidadeController();
