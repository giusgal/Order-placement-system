let express = require('express');
let tavoliServices = require('../services/tavoli.services');
let { IllegalArgumentException } = require('../exceptions/exceptions');

let router = express.Router();

router.get("/tavoli", async (req, res) => {
    try {
        let tavoli = await tavoliServices.readTavoli();
        res.status(200).json({message: tavoli});
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
    if(isNaN(numeroTavolo) || numeroTavolo < 0) {
        res.status(400).json({message: "numero del tavolo non valido"});
        return;
    }

    if(isNaN(occupanti) || occupanti <= 0) {
        res.status(400).json({message: "numero di occupanti non valido"});
        return;
    }

    // creo l'ordine
    try {
        await tavoliServices.createOrdine(numeroTavolo, occupanti);
        res.status(200).json({message: "ordine creato correttamente"});
        return;
    } catch(err) {
        if(err instanceof IllegalArgumentException) {
            res.status(400).json({message: err.message});
            return;
        } else {
            res.status(500).json({message: err.message});
            return;
        }
    }
});

router.post("/tavoli/:numero/ordine/pietanze/:pietanza", async (req, res) => {
    let numeroTavolo = parseInt(req.params.numero);
    let pietanza = parseInt(req.params.pietanza);

    // verifico che il numero del tavolo e l'id della pietanza siano validi
    if(isNaN(numeroTavolo) || numeroTavolo < 0) {
        res.status(400).json({message: "numero del tavolo non valido"});
        return;
    }

    if(isNaN(pietanza) || pietanza < 0) {
        res.status(400).json({message: "id della pietanza non valido"});
        return;
    }

    // aggiungo la pietanza all'ordine
    try {
        let infoPietanza = await tavoliServices.addPietanza(numeroTavolo, pietanza);
        res.status(200).json({message: infoPietanza});
        return;
    } catch(err) {
        if(err instanceof IllegalArgumentException) {
            res.status(400).json({message: err.message});
            return;
        } else {
            res.status(500).json({message: err.message});
            return;
        }
    }
});

router.post("/tavoli/:numero/ordine/stato", async (req, res) => {
    let numeroTavolo = parseInt(req.params.numero);

    // verifico che il numero del tavolo sia valido
    if(isNaN(numeroTavolo) || numeroTavolo < 0) {
        res.status(400).json({message: "numero del tavolo non valido"});
        return;
    }

    // aggiorno lo stato dell'ordine
    try {
        let stato = await tavoliServices.updateStatoOrdine(numeroTavolo);
        res.status(200).json({message: stato});
        return;
    } catch(err) {
        if(err instanceof IllegalArgumentException) {
            res.status(400).json({message: err.message});
            return;
        } else {
            res.status(500).json({message: err.message});
            return;
        }
    }
});

module.exports = router;