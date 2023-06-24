let { IllegalArgumentException } = require('../exceptions/exceptions');
let mongoose = require('mongoose');

let Tavolo = require('../models/tavolo').tavoloModel;
let states = require('../models/tavolo').states;
let Pietanze = require('../models/pietanza');
let Ingredienti = require('../models/ingrediente');

let readTavoli = async function() {
    try {
        let tavoli = await Tavolo.find({});
        return tavoli;
    } catch(err) {
        throw new Error("impossibile accedere ai dati richiesti");
    }
}

let createOrdine = async function(numeroTavolo, occupanti) {
    let tavolo = null;

    // verifico esistenza numero tavolo
    try {
        tavolo = await Tavolo.findOne({numero: numeroTavolo}).orFail();
    } catch(err) {
        if(err instanceof mongoose.Error.DocumentNotFoundError) {
            throw new IllegalArgumentException("tavolo non esistente");
        } else {
            throw new Error("impossibile accedere ai dati richiesti");
        }
    }

    // verifico che il numero di occupanti sia valido
    if(occupanti > tavolo.capacita) {
        throw new IllegalArgumentException("il numero di occupanti supera la capacità del tavolo");
    }
    
    // creo l'ordine al tavolo
    try {
        await Tavolo.updateOne(
        {
            numero: numeroTavolo,
            ordine: {$exists: false}
        },
        {
            ordine: { stato: 'creato', occupanti: occupanti, pietanze: [] }
        }).orFail();
    } catch(err) {
        if(err instanceof mongoose.Error.DocumentNotFoundError) {
            throw new IllegalArgumentException("esiste un ordine aperto al tavolo selezionato");
        } else {
            throw new Error("impossibile accedere ai dati richiesti");
        }
    }
}

let updateStatoOrdine = async function(numeroTavolo) {
    let tavolo = null;

    // verifico esistenza numero tavolo
    try {
        tavolo = await Tavolo.findOne({numero: numeroTavolo}).orFail();
    } catch(err) {
        if(err instanceof mongoose.Error.DocumentNotFoundError) {
            throw new IllegalArgumentException("tavolo non esistente");
        } else {
            throw new Error("impossibile modificare lo stato dell'ordine");
        }
    }

    // verifico presenza ordine
    if(tavolo.ordine === undefined) {
        throw new IllegalArgumentException("non esiste un ordine aperto al tavolo selezionato"); 
    }

    try {
        if(tavolo.ordine.stato === states[states.length-1]) {
            // se l'ordine si trova nell'ultimo stato (completato) => lo elimino
            await Tavolo.updateOne({numero: numeroTavolo}, {$unset: {ordine: 1}}).orFail();
        } else {
            // altrimenti, porto l'ordine nel prossimo stato
            let currentState = tavolo.ordine.stato;
            let nextState = states[states.indexOf(currentState)+1];
            await Tavolo.updateOne({numero: numeroTavolo}, {$set: {"ordine.stato": nextState}}).orFail();
        }
    } catch(err) {
        throw new Error("impossibile modificare lo stato dell'ordine");
    }
}

let addPietanza = async function(numeroTavolo, idPietanza) {

}

module.exports = {
    readTavoli,
    createOrdine,
    updateStatoOrdine
}