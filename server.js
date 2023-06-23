let http = require('http');
let express = require('express');
let mongoose = require('mongoose');

let app = express();

/* Connessione al DB */
mongoose.connect('mongodb://127.0.0.1:27017/ristorante_db')
.then(function() {
	console.log("Connessione avvenuta verso mongodb");
});

/* Definizione schemi e modelli */

/* Creazione server */
http.createServer(app).listen(5000, function() {
	console.log("Server listening on localhost:5000");
});

/* Definizione rotte */
app.get("/test", function(req, res) {
	res.send("Hello, World!");
});
