# SoldiSotto

SoldiSotto is a web application developed in React, designed to manage personal finances. This project was created with the aim of exploring and learning the features of the React framework, also integrating Firebase for backend management.

## Features

- **Registration and Login**: Users can create an account or log in with existing credentials.
- **Add Transactions**: Easily and quickly record your income and expenses.
- **Chronological View**: View all your transactions in chronological order.
- **Statistics**: View financial statistics by day, week, month, or year.
- **PDF Generation**: Generate a PDF containing all transactions for a selected period (day, week, month, year) along with relevant statistics.

## Technologies Used

- **React**: JavaScript framework used to build the user interface.
- **Firebase**: Used as the backend for authentication and transaction data management.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- A configured Firebase account.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/SoldiSotto.git
   ```
2. Navigate to the project directory:

   ```bash
   cd SoldiSotto
   ```
3. Install dependencies:

   ```bash
   npm install
   ```
4. Configure Firebase:

   - Create a project on Firebase.
   - Obtain your Firebase configuration credentials and insert them into a `.env` file at the root of the project.

   Example of a `.env` file:

   ```plaintext
   REACT_APP_API_KEY=your-api-key
   REACT_APP_AUTH_DOMAIN=your-auth-domain
   REACT_APP_PROJECT_ID=your-project-id
   REACT_APP_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_APP_ID=your-app-id
   ```
5. Start the application:

   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`.

## Deployment on GitHub Pages

To deploy this project on GitHub Pages:

1. Install the `gh-pages` package if not already installed:
   ```bash
   npm install gh-pages --save-dev
   ```

2. Configure your `package.json` by adding the `"homepage"` field:
   ```json
   "homepage": "https://your-username.github.io/repository-name"
   ```
   Replace `your-username` with your GitHub username and `repository-name` with the repository name.

3. Add the following `scripts` to `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```

4. Run the deployment command:
   ```bash
   npm run deploy
   ```

5. Go to your GitHub repository settings under **Pages** to ensure that `gh-pages` is selected as the source branch. Your application will be live at the URL defined in the `homepage` field.

## Contributions

Since this is one of my first projects in React, any suggestions or contributions are welcome! If you'd like to contribute, feel free to open a pull request or report any issues via the issues tab.

## Contact

For questions or suggestions, you can contact me via email: [solomon.taiwo@studenti.polito.it](mailto:solomon.taiwo@studenti.polito.it).

---

# SoldiSotto - ITA

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

## Deploy su GitHub Pages

Per fare il deploy di questo progetto su GitHub Pages:

1. Installa il pacchetto `gh-pages` se non è già installato:
   ```bash
   npm install gh-pages --save-dev
   ```

2. Configura il tuo `package.json` aggiungendo il campo `"homepage"`:
   ```json
   "homepage": "https://tuo-username.github.io/nome-repository"
   ```
   Sostituisci `tuo-username` con il tuo username GitHub e `nome-repository` con il nome della repository.

3. Aggiungi i seguenti `scripts` in `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```

4. Esegui il comando di deploy:
   ```bash
   npm run deploy
   ```

5. Vai nelle impostazioni del repository GitHub sotto **Pages** e assicurati che la branch `gh-pages` sia selezionata come sorgente. La tua applicazione sarà visibile all'URL definito nel campo `homepage`.

## Contributi

Essendo uno dei miei primi progetti in React, qualsiasi suggerimento o contributo è ben accetto! Se vuoi contribuire, sentiti libero di aprire una pull request o di segnalare eventuali problemi tramite le issue.

## Contatti

Per domande o suggerimenti, puoi contattarmi via email: [solomon.taiwo@studenti.polito.it](mailto:solomon.taiwo@studenti.polito.it).
```