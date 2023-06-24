let mongoose = require('mongoose');
let states = ['creato', 'pendente', 'completato'];

let tavoloSchema = new mongoose.Schema({
    numero: Number,
    capacita: Number,
    ordine: {
        type: {
            stato: {
                type: String,
                enum: states,
            },
            occupanti: Number,
            pietanze: [
                {
                    pietanza: {type: mongoose.Schema.Types.ObjectId, ref: 'pietanza'},
                    quantita: Number
                }
            ]
        }
    }
});

let tavoloModel = mongoose.model('tavolo', tavoloSchema);

module.exports = {
    tavoloModel,
    states
}