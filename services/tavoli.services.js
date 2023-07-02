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

/* recupera un tavolo dal DB e lo restituisce */
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

/* recupera i tavoli dal DB e li restituisce */
let readTavoli = async function() {
    try {
        let tavoli = await Tavolo.find({});
        return tavoli;
    } catch(err) {
        throw new Error("impossibile accedere ai dati richiesti");
    }
}

/* crea un nuovo ordine al tavolo selezionato */
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

/* aggiunge una pietanza ad un ordine */
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

        // modifico le scorte degli ingredienti presenti nella pietanza
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

        // ritorno informazioni sulla pietanza aggiunta
        return {
            nome: pietanza.nome,
            prezzo: pietanza.prezzo
        }
    } catch(err) {
        await session.abortTransaction();
        await session.endSession();

        if(err.codeName === "WriteConflict") {
            throw new Error("Problemi nel prenotare la pietanza, riprova");
        } else {
            throw new IllegalArgumentException("ingredienti non disponibili");
        }

    }
    
}

/* aggiorna lo stato dell'ordine */
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
            return {nuovoStato: "none"};
        } else {
            // altrimenti, porto l'ordine nel prossimo stato
            let currentState = tavolo.ordine.stato;
            let nextState = states[states.indexOf(currentState)+1];
            await Tavolo.updateOne({numero: numeroTavolo}, {$set: {"ordine.stato": nextState}}).orFail();
            return {nuovoStato: nextState};
        }
    } catch(err) {
        if(err instanceof mongoose.Error) {
            throw new Error("impossibile accedere ai dati richiesti");
        } else {
            throw new IllegalArgumentException("impossibile modificare lo stato dell'ordine");
        }
    }
}

module.exports = {
    readTavoli,
    createOrdine,
    addPietanza,
    updateStatoOrdine
}