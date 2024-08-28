# SoldiSotto

SoldiSotto è un'applicazione web sviluppata in React, progettata per gestire le proprie finanze personali. Questo progetto nasce con l'obiettivo di esplorare e apprendere le funzionalità del framework React, integrando anche Firebase per la gestione del backend.

## Funzionalità

- **Registrazione e Login**: Gli utenti possono creare un account o accedere con credenziali esistenti.
- **Aggiunta di Transazioni**: Registra le tue entrate e uscite in modo semplice e rapido.
- **Visualizzazione Cronologica**: Consulta tutte le tue transazioni in ordine cronologico.
- **Statistiche**: Visualizza le statistiche delle tue finanze per giorno, settimana, mese o anno.
- **Generazione di PDF**: Genera un PDF contenente tutte le transazioni per un periodo selezionato (giorno, settimana, mese, anno) insieme a statistiche rilevanti.

## Tecnologie Utilizzate

- **React**: Framework JavaScript utilizzato per costruire l'interfaccia utente.
- **Firebase**: Utilizzato come backend per l'autenticazione e la gestione dei dati delle transazioni.

## Come Iniziare

### Prerequisiti

- Node.js installato sulla tua macchina.
- Un account Firebase configurato.

### Installazione

1. Clona la repository:

   ```bash
   git clone https://github.com/tuo-username/SoldiSotto.git
   ```
2. Naviga nella directory del progetto:

   ```bash
   cd SoldiSotto
   ```
3. Installa le dipendenze:

   ```bash
   npm install
   ```
4. Configura Firebase:

   - Crea un progetto su Firebase.
   - Ottieni le tue credenziali di configurazione Firebase e inseriscile nel file `.env` nella radice del progetto.

   Esempio di file `.env`:

   ```plaintext
   REACT_APP_API_KEY=tuo-api-key
   REACT_APP_AUTH_DOMAIN=tuo-auth-domain
   REACT_APP_PROJECT_ID=tuo-project-id
   REACT_APP_STORAGE_BUCKET=tuo-storage-bucket
   REACT_APP_MESSAGING_SENDER_ID=tuo-messaging-sender-id
   REACT_APP_APP_ID=tuo-app-id
   ```
5. Avvia l'applicazione:

   ```bash
   npm start
   ```

   L'app sarà disponibile su `http://localhost:3000`.

## Contributi

Essendo uno dei miei primi progetti in React, qualsiasi suggerimento o contributo è ben accetto! Se vuoi contribuire, sentiti libero di aprire una pull request o di segnalare eventuali problemi tramite le issue.

## Contatti

Per domande o suggerimenti, puoi contattarmi via email: [solomon.taiwo@studenti.polito.it](mailto:solomon.taiwo@studenti.polito.it).
