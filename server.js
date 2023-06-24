let express = require('express');
let mongoose = require('mongoose');
let tavoliRoutes = require('./routes/tavoli.routes');

let app = express();

/* Utilizzo rotte */
app.use(express.json());
app.use(tavoliRoutes);

let startServer = function(port) {
	/* Creazione server */
	app.listen(port, () => {
		console.log("Server in ascolto su localhost:"+port);

		/* Connessione al DB */
		mongoose.connect('mongodb://127.0.0.1:27017/ristorante_db')
		.then(() => {
			console.log("Connessione avvenuta verso mongodb");
		})
		.catch((err) => {
			console.log("Errore: impossibile connettersi a mongodb");
			process.exit();
		});
	})
	.on('error', (err) => {
		console.log("Errore: impossibile creare un server su localhost:"+port);
		process.exit();
	});
}

startServer(5000);