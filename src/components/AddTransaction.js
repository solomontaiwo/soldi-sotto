import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "./AuthProvider";
import "./AddTransaction.css"; // Assicurati di avere questo file CSS

const AddTransaction = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState("entrata");
  const [date, setDate] = useState("");
  const [method, setMethod] = useState("contanti");
  const [notes, setNotes] = useState("");
  const [place, setPlace] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Devi essere loggato per aggiungere una transazione.");
      return;
    }
    try {
      await addDoc(collection(firestore, "transactions"), {
        name,
        type,
        date,
        method,
        notes,
        place,
        userId: currentUser.uid,
      });
      setName("");
      setType("entrata");
      setDate("");
      setMethod("contanti");
      setNotes("");
      setPlace("");
      setError("");
    } catch (err) {
      setError("Errore durante l'aggiunta della transazione.");
      console.error(err);
    }
  };

  return (
    <div className="add-transaction-container">
      <h2>Aggiungi Transazione</h2>
      <form onSubmit={handleSubmit} className="add-transaction-form">
        <div className="form-group">
          <label>Nome</label>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="entrata">Entrata</option>
            <option value="uscita">Uscita</option>
          </select>
        </div>
        <div className="form-group">
          <label>Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Metodo</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="contanti">Contanti</option>
            <option value="carta">Carta di Debito</option>
          </select>
        </div>
        <div className="form-group">
          <label>Luogo</label>
          <select value={place} onChange={(e) => setPlace(e.target.value)}>
            <option value="">Seleziona</option>
            <option value="Online">Online</option>
            <option value="Luogo">Luogo</option>
          </select>
          {place === "Luogo" && (
            <input
              type="text"
              placeholder="Attività, città (provincia)"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            />
          )}
        </div>
        <div className="form-group">
          <label>Note</label>
          <textarea
            placeholder="Note"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit">Aggiungi</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default AddTransaction;
