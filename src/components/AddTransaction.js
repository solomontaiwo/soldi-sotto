import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "./AuthProvider";

const AddTransaction = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState("entrata"); // Default type
  const [date, setDate] = useState("");
  const [method, setMethod] = useState("contanti"); // Default method
  const [notes, setNotes] = useState("");
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
        userId: currentUser.uid,
      });
      setName("");
      setType("entrata");
      setDate("");
      setMethod("contanti");
      setNotes("");
      setError("");
    } catch (err) {
      setError("Errore durante l'aggiunta della transazione.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Aggiungi Transazione</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="entrata">Entrata</option>
          <option value="uscita">Uscita</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="contanti">Contanti</option>
          <option value="carta">Carta di Debito</option>
        </select>
        <textarea
          placeholder="Note"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button type="submit">Aggiungi</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default AddTransaction;
