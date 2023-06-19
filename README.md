# ProgettoACP - Sistema gestione ristorante

## Test

## Screenshots
<p align="center">
    <img src="./Cattura.PNG">
</p>

## Risorse
| Metodo    | Risorsa                                     | Descrizione                                                                     |
|-----------|---------------------------------------------|---------------------------------------------------------------------------------|
| GET       | /tavoli                                     | Restituisce le informazioni sui tavoli del ristorante                           |
| POST      | /tavoli/{numero}/ordine                     | Crea un nuovo ordine al tavolo identificato da {numero}                         |
| PUT       | /tavoli/{numero}/ordine/pietanze/{pietanza} | Inserisce la pietanza {pietanza} nell'ordine al tavolo identificato da {numero} |
| PUT       | /tavoli/{numero}/ordine/stato               | Aggiorna lo stato dell'ordine al tavolo identificato da {numero}                |
| DELETE    | /tavoli/{numero}/ordine/pietanze/{pietanza} | Elimina la pietanza {pietanza} dall'ordine al tavolo identificato da {numero}   |

## Diagramma ER
```mermaid
erDiagram
    Tavolo ||--|| Ordine: ""
    Ordine }o--o{ Pietanza: "contiene"
    Pietanza }o--|{ Ingrediente: "contiene"

    Tavolo {
        numero Number PK
        capacita Number
    }

    Ordine {
        id Number PK
        occupanti Number
        stato String
        prezzo Number
    }

    Pietanza {
        id Number PK
        nome String
        prezzo Number
    }

    Ingrediente {
        id Number PK
        nome String
        scorte Number
    }
```
