import React, { useState } from "react";
import { db } from "../firebase";
import { useAuth } from "./AuthProvider";

const TransactionForm = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("entrata");
  const [date, setDate] = useState("");
  const [method, setMethod] = useState("contanti");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await db.collection("transactions").add({
        name,
        type,
        date,
        method,
        notes,
        userId: currentUser.uid,
      });
      setMessage("Transazione inserita con successo!");
    } catch (err) {
      setMessage("Errore nell'inserimento della transazione.");
    }
  };

  return (
    <div>
      <h2>Inserisci una nuova transazione</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome della transazione"
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="entrata">Entrata</option>
          <option value="uscita">Uscita</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="contanti">Contanti</option>
          <option value="carta di debito">Carta di Debito</option>
        </select>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Note"
        />
        <button type="submit">Inserisci Transazione</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TransactionForm;
