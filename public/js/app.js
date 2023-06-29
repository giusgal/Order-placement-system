/*
* VISTE
*/
let vistaTavoli = async () => {
    "use strict";

    let tavoli = await $.getJSON("/tavoli");

    const tableCard =
        `<div class="table-card" id="#{numero_tavolo}">
            <div class="table-card-header">
                <h1 class="table-card-title">#{numero_tavolo}</h1>
            </div>
            <div class="table-card-body">
                <span class="material-symbols-outlined">event_seat</span>
                <h2 class="table-card-capacity">#{capacita_tavolo}</h2>
            </div>
        </div>`;
    
    $("main").slideUp(200, () => {
        $("main").empty();
        $("main").hide();

        // aggiungo tavoli al DOM
        tavoli.forEach(tavolo => {
            //console.log(tavolo.ordine);
            if(tavolo.ordine === undefined) {
                $("main").append(
                    tableCard
                    .replaceAll("#{numero_tavolo}", tavolo.numero)
                    .replaceAll("#{capacita_tavolo}", tavolo.capacita)
                )
            }
        });
        $("main").slideDown(200);
    });
}

let vistaOrdineOccupanti = (numeroTavolo, capacita) => {
    "use strict";

    const ordineCard = 
        `<div class="ordine-card" id="#{numero_tavolo}">
            <div class="ordine-card-header">
                <h1 class="ordine-card-title">tavolo #{numero_tavolo}</h1>
            </div>
            <div class="ordine-card-body">
                <span class="material-symbols-outlined">
                    event_seat
                </span>
                <h2 class="table-card-capacity">#{capacita_tavolo}</h2>

                <div class="ordine-card-body-inserimentoOccupanti">
                    <h3>Numero di occupanti:</h3>
                    <input type="number" name="numero_occupanti" id="numero_occupanti">
                    <input type="button" value="crea ordine" id="creaOrdine">
                </div>
            </div>
        </div>`;

    $("main").slideUp(200, () => {
        $("main").empty();
        $("main").hide();

        // aggiungo card ordine al DOM
        $("main").append(
            ordineCard
            .replaceAll("#{numero_tavolo}", numeroTavolo)
            .replaceAll("#{capacita_tavolo}", capacita)
        );
        $("main").slideDown(200);
    });
}

let main = () => {
    "use strict";

    // EVENT LISTENERS
    $("main").on("click", ".table-card", function() {
        let numeroTavolo = $(this).attr("id");
        let capacita = $($($(this).children()[1]).children()[1]).text();
        
        vistaOrdineOccupanti(numeroTavolo, capacita);
    });

    $("main").on("click", "#creaOrdine", function () {
        let occupanti = $("#numero_occupanti").val();
        
        if(occupanti !== "") {
            let numeroTavolo = $(".ordine-card").attr("id");
            //let capacita = $(".table-card-capacity").text();

            $.ajax({
                method: "PUT",
                url: "/tavoli/"+numeroTavolo+"/ordine",
                data: JSON.stringify({occupanti: occupanti}),
                contentType: "application/json"
            })
            .then((msg) => {
                // aggiorno vista ordine
                //vistaOrdinePietanze(numeroTavolo, occupanti, capacita);

                const inputPietanze = 
                `
                    <div class="ordine-card-body-pietanze">
                        <h3>Pietanze:</h3>
                        <ul>
                        </ul>
                        <input type="number" name="pietana" id="pietanza">
                        <input type="button" value="Aggiungi" id="aggiungiPietanza">
                        <input type="button" value="conferma" id="confermaOrdine">
                    </div>
                `;

                $(".ordine-card-body-inserimentoOccupanti h3").text("Numero di occupanti: "+occupanti);
                $(".ordine-card-body-inserimentoOccupanti input").remove();
                $(".ordine-card-body").append(inputPietanze);
            })
            .fail((err) => {
                alert(JSON.parse(err.responseText).message);
            });
        }
    });

    $("main").on("click", "#aggiungiPietanza", function () {
        let pietanza = $("#pietanza").val();

        if(pietanza !== "") {
            let numeroTavolo = $(".ordine-card").attr("id");

            $.ajax({
                method: "POST",
                url: "/tavoli/"+numeroTavolo+"/ordine/pietanze/"+pietanza
            })
            .then((msg) => {
                let nomePietanza = msg.message.nome;

                $("ul").prepend(
                    "<li>"+nomePietanza+"</li>"
                );
            })
            .fail((err) => {
                alert(JSON.parse(err.responseText).message);
            });
        }
    });

    $("main").on("click", "#confermaOrdine", function () {
        let numeroPietanze = $("ul").children().length;

        if(numeroPietanze !== 0) {
            let numeroTavolo = $(".ordine-card").attr("id");

            $.ajax({
                method: "POST",
                url: "/tavoli/"+numeroTavolo+"/ordine/stato"
            })
            .then((msg) => {
                //console.log(msg);

                vistaTavoli();
            })
            .fail((err) => {
                alert(JSON.parse(err.responseText).message);
            });

        }
    });

    vistaTavoli();
}

$("document").ready(() => {
    "use strict";
    main();
});