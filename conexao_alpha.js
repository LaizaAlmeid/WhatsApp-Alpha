const axios = require("axios");

const api = axios.create({
    baseURL: 'https://sitema-alpha-provedornet.bubbleapps.io/version-test/api/1.1/wf/apiwpp/initialize'
});

module.exports = api;
