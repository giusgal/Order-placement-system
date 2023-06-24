let mongoose = require('mongoose');

let ingredienteSchema = new mongoose.Schema({
    id: Number,
    nome: String,
    scorte: Number
});

let ingredienteModel = mongoose.model("ingrediente", ingredienteSchema);

module.exports = ingredienteModel;