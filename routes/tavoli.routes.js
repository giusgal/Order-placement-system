let express = require('express');
let tavoliServices = require('../services/tavoli.services');
let { IllegalArgumentException } = require('../exceptions/exceptions');

let router = express.Router();

router.get("/tavoli", async (req, res) => {
    try {
        let tavoli = await tavoliServices.readTavoli();
        res.status(200).json(tavoli);
        return;
    } catch(err) {
        res.status(500).json({message: err.message});
        return;
    }
});

router.put("/tavoli/:numero/ordine", async (req, res) => {
    let numeroTavolo = parseInt(req.params.numero);
    let occupanti = parseInt(req.body.occupanti);

    // verifico che il numero del tavolo e il numero di occupanti siano validi
    if(isNaN(numeroTavolo)) {
        res.status(400).json({message: "numero del tavolo mancante"});
        return;
    }

    if(isNaN(occupanti)) {
        res.status(400).json({message: "numero di occupanti mancante"});
        return;
    }

    // creo l'ordine
    try {
        await tavoliServices.createOrdine(numeroTavolo, occupanti);
        res.status(200).json({message: "ordine creato correttamente"});
        return;
    } catch(err) {
        if(err instanceof IllegalArgumentException) {
            res.status(422).json({message: err.message});
            return;
        } else {
            res.status(500).json({message: err.message});
            return;
        }
    }
});

router.post("/tavoli/:numero/ordine/pietanze/:pietanza", );

router.post("/tavoli/:numero/ordine/stato", async (req, res) => {
    let numeroTavolo = parseInt(req.params.numero);

    // verifico che il numero del tavolo sia valido
    if(isNaN(numeroTavolo)) {
        res.status(400).json({message: "numero del tavolo mancante"});
        return;
    }

    try {
        await tavoliServices.updateStatoOrdine(numeroTavolo);
        res.status(200).json({message: "stato aggiornato correttamente"});
        return;
    } catch(err) {
        if(err instanceof IllegalArgumentException) {
            res.status(422).json({message: err.message});
            return;
        } else {
            res.status(500).json({message: err.message});
            return;
        }
    }
});

module.exports = router;