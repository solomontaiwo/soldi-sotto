import React, { useState } from "react";
import { firestore } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../Auth/AuthProvider";
import "./TransactionForm.css";

const TransactionForm = () => {
  const { currentUser } = useAuth();
  const [type, setType] = useState("expense"); // Tipo di transazione predefinito
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10)); // Imposta la data di oggi
  const [place, setPlace] = useState(""); // Campo per il luogo
  const [paymentMethod, setPaymentMethod] = useState(""); // Campo per il metodo di pagamento
  const [locationType, setLocationType] = useState("online"); // Tipo di luogo predefinito

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (amount && description && date && currentUser) {
      try {
        await addDoc(collection(firestore, "transactions"), {
          userId: currentUser.uid,
          type,
          amount: parseFloat(amount),
          description,
          date: new Date(date),
          place,
          paymentMethod,
          locationType,
        });
        // Resetta i campi del form dopo l'inserimento
        setType("expense");
        setAmount("");
        setDescription("");
        setDate(new Date().toISOString().substring(0, 10));
        setPlace("");
        setPaymentMethod("");
        setLocationType("online");
      } catch (error) {
        console.error("Errore durante l'aggiunta della transazione: ", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h3>Aggiungi Transazione</h3>

      <div className="form-group">
        <label htmlFor="type" className="required">
          Tipo di Transazione
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="expense">Uscita</option>
          <option value="income">Entrata</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="amount" className="required">
          Importo (€)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Importo"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description" className="required">
          Descrizione
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrizione"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="date" className="required">
          Data
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="paymentMethod">Metodo di Pagamento</label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">Seleziona Metodo</option>
          <option value="cash">Contanti</option>
          <option value="card">Carta</option>
          <option value="bankTransfer">Bonifico</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="locationType">Tipo di Luogo</label>
        <select
          id="locationType"
          value={locationType}
          onChange={(e) => setLocationType(e.target.value)}
        >
          <option value="physical">Attività</option>
          <option value="online">Online (sito web, app, ecc.)</option>
        </select>
      </div>

      {locationType === "physical" && (
        <div className="form-group">
          <label htmlFor="place">Dettaglio Luogo</label>
          <input
            id="place"
            type="text"
            placeholder="Attività, città (provincia)"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </div>
      )}

      {locationType === "online" && (
        <div className="form-group">
          <label htmlFor="place">Dettaglio Luogo</label>
          <input
            id="place"
            type="text"
            placeholder="Specifica sito web, app, ecc."
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </div>
      )}

      <button type="submit" className="submit-button">
        Aggiungi Transazione
      </button>
    </form>
  );
};

export default TransactionForm;
