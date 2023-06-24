let express = require('express');
let mongoose = require('mongoose');

let Tavolo = require('../models/tavolo').tavoloModel;
let Pietanza = require('../models/pietanza');
let ingrediente = require('../models/ingrediente');

let app = express();

mongoose.connect('mongodb://127.0.0.1:27017/ristorante_db').then(() => {
    console.log("OK: mongodb");
});

app.listen(5000, () => {
    console.log("OK: server");
});

app.get("/test", async (req, res) => {
    try {
        // aggiungo una pietanza
        // await Pietanza.create({id: 1, nome: "carbonara", prezzo: 15.00, ingredienti: []});

        /*
        // cerco il tavolo
        let tavolo = await Tavolo.findOne({numero: 1});

        // cerco la pietanza
        let pietanza = await Pietanza.findOne({id: 1});

        // aggiungo una pietanza
        tavolo.ordine.pietanze.push({
            pietanza: pietanza._id,
            quantita: 1
        });

        await tavolo.save();
        */

        // cerco il tavolo
        /*
        await Tavolo.findOne({numero: 1}).populate('ordine.pietanze.pietanza').exec()
        .then(item => {
            console.log(item.ordine.pietanze);
        });
        */

        // creo un tavolo
        //await Tavolo.create({numero: 1, capacita: 6, ordine: {stato: 'creato', occupanti: 4, pietanze: [] }});
        //await Tavolo.create({numero: 1, capacita: 6});

        // aggiorno un ordine
        //await Tavolo.updateOne({numero: 1}, {$set: {ordine: { stato: 'creato', occupanti: 5, pietanze: [] }}});

        // aggiungo ordine
        //await Ordine.create({occupanti: 5})


        //aggiorno tavolo
        //await Tavolo.updateOne({numero: 1}, )

        let tavolo = await Tavolo.find({numero: 1});
        //let pietanza = await Pietanza.findOne({id:1});
        console.log(tavolo);

        res.send("ok");
        
    }
    catch(err) {
        console.log(err);
        res.send("error");
    }
});