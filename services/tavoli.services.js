let { IllegalArgumentException } = require('../exceptions/exceptions');
let mongoose = require('mongoose');

let Tavolo = require('../models/tavolo').tavoloModel;
let states = require('../models/tavolo').states;
let Pietanza = require('../models/pietanza');
let Ingrediente = require('../models/ingrediente');

/* Connessione al DB */
mongoose.connect('mongodb://127.0.0.1:27017/ristorante_db')
.then(() => {
    console.log("Connessione avvenuta verso mongodb");
})
.catch((err) => {
    console.log("Errore: impossibile connettersi a mongodb");
    process.exit();
});

/* Funzioni di utilità */
let getTavolo = async function(numeroTavolo) {
    try {
        let tavolo = await Tavolo.findOne({numero: numeroTavolo}).orFail();

        return tavolo;
    } catch(err) {
        if(err instanceof mongoose.Error.DocumentNotFoundError) {
            throw new IllegalArgumentException("tavolo non esistente");
        } else {
            throw new Error("impossibile accedere ai dati richiesti");
        }
    }
}

/* Servizi */
let readTavoli = async function() {
    try {
        let tavoli = await Tavolo.find({});
        return tavoli;
    } catch(err) {
        throw new Error("impossibile accedere ai dati richiesti");
    }
}

let createOrdine = async function(numeroTavolo, occupanti) {
    let tavolo = await getTavolo(numeroTavolo);

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
    let tavolo = await getTavolo(numeroTavolo);

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

/*
* 1. verifico esistenza tavolo e ordine
* 2. verifico esistenza pietanza
* 3. Begin transaction
*   4. sottraggo le scorte da tutti gli ingredienti presenti nella pietanza
*       4.1 se un ingrediente non presenta scorte sufficienti => abort()
*   5. aggiungo la pietanza all'ordine
*       5.1 se la pietanza è già presente nell'ordine => incremento solo la quantità
* 6. End transaction
*/
let addPietanza = async function(numeroTavolo, idPietanza) {
    // verifico esistenza numero tavolo
    let tavolo = await getTavolo(numeroTavolo);

    // verifico che al tavolo selezionato sia presente un ordine nello stato "creato"
    if(tavolo.ordine === undefined || tavolo.ordine.stato !== states[0]) {
        throw new IllegalArgumentException("ordine non presente o già confermato");
    }

    // verifico esistenza pietanza
    let pietanza = null;
    try {
        pietanza = await Pietanza.findOne({id: idPietanza}).orFail();
    } catch(err) {
        if(err instanceof mongoose.Error.DocumentNotFoundError) {
            throw new IllegalArgumentException("pietanza non esistente");
        } else {
            throw new Error("impossibile accedere ai dati richiesti");
        }
    }

    // popolo la pietanza con i suoi ingredienti
    await pietanza.populate("ingredienti.ingrediente");

    let session = await mongoose.startSession();
    try {
        session.startTransaction();

        // sottraggo le scorte dagli ingredienti presenti nella pietanza
        for(let i = 0; i < pietanza.ingredienti.length; ++i) {
            let idIngrediente = pietanza.ingredienti[i].ingrediente.id;
            let quantitaRichiesta = pietanza.ingredienti[i].quantita;

            await Ingrediente.updateOne(
                {id: idIngrediente, scorte: {$gte: quantitaRichiesta}},
                {$inc: {scorte: (-1)*quantitaRichiesta}},
                {session: session}
            ).orFail();
        }
        
        // aggiungo pietanza all'ordine
        //  se la pietanza è già presente => incremento la quantità di 1
        //  se non è presente => la aggiungo
        let found = false;

        for(let i = 0; i < tavolo.ordine.pietanze.length; ++i) {
            if(tavolo.ordine.pietanze[i].pietanza.equals(pietanza._id)) {
                tavolo.ordine.pietanze[i].quantita += 1;
                found = true;
                break;
            }
        }

        if(!found) {
            tavolo.ordine.pietanze.push({
                pietanza: pietanza._id,
                quantita: 1
            });
        }

        await tavolo.save({session: session});

        await session.commitTransaction();
        await session.endSession();
    } catch(err) {
        await session.abortTransaction();
        await session.endSession();

        throw new Error("ingredienti non disponibili");
    }
    
}

module.exports = {
    readTavoli,
    createOrdine,
    updateStatoOrdine,
    addPietanza
}