let express = require('express');
let tavoliRoutes = require('./routes/tavoli.routes');

let app = express();

app.use(express.static(__dirname));
app.use(express.json());

/* Utilizzo rotte */
app.use(tavoliRoutes);

let startServer = function(port) {
	/* Creazione server */
	app.listen(port, () => {
		console.log("Server in ascolto su localhost:"+port);
	})
	.on('error', (err) => {
		console.log("Errore: impossibile creare un server su localhost:"+port);
		process.exit();
	});
}

startServer(5000);
