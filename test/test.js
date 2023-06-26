let express = require('express');
let mongoose = require('mongoose');

let Tavolo = require('../models/tavolo').tavoloModel;
let Pietanza = require('../models/pietanza');
let Ingrediente = require('../models/ingrediente');

let app = express();

mongoose.connect('mongodb://127.0.0.1:27017/ristorante_db').then(async () => {
    console.log("OK: mongodb");
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

        //let tavolo = await Tavolo.find({numero: 1});
        //let pietanza = await Pietanza.findOne({id:1});
        //console.log(tavolo);

        // Inserimento degli ingredienti per la pietanza "carbonara"
        /*
        await Ingrediente.create({
            id: 1,
            nome: "uova",
            scorte: 10
        });

        await Ingrediente.create({
            id: 2,
            nome: "pancetta",
            scorte: 15
        });

        await Ingrediente.create({
            id: 3,
            nome: "pecorino",
            scorte: 20
        });

        await Ingrediente.create({
            id: 4,
            nome: "pepe nero",
            scorte: 5
        });

        await Ingrediente.create({
            id: 5,
            nome: "spaghetti",
            scorte: 25
        });
        */

        // Inserimento degli ingredienti per la pietanza "pasta e sugo"
        /*
        await Ingrediente.create({
            id: 6,
            nome: "rigatoni",
            scorte: 1000
        });

        await Ingrediente.create({
            id: 7,
            nome: "sugo di pomodoro",
            scorte: 15
        });

        await Ingrediente.create({
            id: 8,
            nome: "olio d'oliva",
            scorte: 10
        });

        await Ingrediente.create({
            id: 9,
            nome: "aglio",
            scorte: 8
        });

        await Ingrediente.create({
            id: 10,
            nome: "basilico",
            scorte: 12
        });
        */

        // modifica pietanza
        /*
        await Pietanza.updateOne({id: 1}, 
            {
                $push: {
                    ingredienti: {
                        $each: [
                            {
                                ingrediente: new mongoose.Types.ObjectId("6498a28d48a9e56182ae125a"),
                                quantita: 1
                            },
                            {
                                ingrediente: new mongoose.Types.ObjectId("6498a28e48a9e56182ae125c"),
                                quantita: 40
                            },
                            {
                                ingrediente: new mongoose.Types.ObjectId("6498a28e48a9e56182ae125e"),
                                quantita: 50
                            },
                            {
                                ingrediente: new mongoose.Types.ObjectId("6498a28e48a9e56182ae1260"),
                                quantita: 2
                            },
                            {
                                ingrediente: new mongoose.Types.ObjectId("6498a28e48a9e56182ae1262"),
                                quantita: 120
                            }
                        ]
                    }
                }
            }
        );
        */

        // aggiungo una nuova pietanza
        /*
        await Pietanza.create({
            id: 2,
            nome: "pasta al sugo",
            prezzo: 10,
            ingredienti: [
                {
                    ingrediente: new mongoose.Types.ObjectId("6498a3e8a115f76a7b5519dc"),
                    quantita: 120
                },
                {
                    ingrediente: new mongoose.Types.ObjectId("6498a3e8a115f76a7b5519de"),
                    quantita: 80
                },
                {
                    ingrediente: new mongoose.Types.ObjectId("6498a3e8a115f76a7b5519e0"),
                    quantita: 15
                },
                {
                    ingrediente: new mongoose.Types.ObjectId("6498a3e8a115f76a7b5519e2"),
                    quantita: 1
                },
                {
                    ingrediente: new mongoose.Types.ObjectId("6498a3e8a115f76a7b5519e4"),
                    quantita: 3
                }
            ]
        });
        */

        /*
        let pietanza = await Pietanza.findOne({id: 2}).populate("ingredienti.ingrediente").exec();

        console.log(pietanza.ingredienti);
        */

        let session = await mongoose.startSession();

        try {
            session.startTransaction();
    
            // test
            await Ingrediente.updateOne({id: 10}, {$inc: {scorte: -10}}, {session: session});

            //console.log("Here");

            //throw new Error("Fail for some reason");
    
            await session.commitTransaction();
            await session.endSession();
        } catch(err) {
            console.log(err);
            await session.abortTransaction();
            await session.endSession();
        }
    }
    catch(err) {
        console.log(err);
        res.send("error");
    }
});

/*
app.listen(5000, () => {
    console.log("OK: server");
});

app.get("/test", async (req, res) => {
    
});
*/