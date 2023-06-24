let tavoliServices = require('../services/tavoli.services');

let readTavoli = async function(req, res) {
    let tavoli = await tavoliServices.readTavoli();

    res.status(200).json(tavoli);
}

let createOrdine = async function(req, res) {
    if(req.params)
}


module.exports = {
    readTavoli
}