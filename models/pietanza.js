let mongoose = require('mongoose');

let pietanzaSchema = new mongoose.Schema({
    id: Number,
    nome: String,
    prezzo: Number,
    ingredienti: [
        {
            ingrediente: {type: mongoose.Schema.Types.ObjectId, ref: "ingrediente"},
            quantita: Number
        }
    ]
});

let pietanzaModel = mongoose.model("pietanza", pietanzaSchema);

module.exports = pietanzaModel;