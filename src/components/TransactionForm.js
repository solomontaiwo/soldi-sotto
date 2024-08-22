import React, { useState } from "react";
import { firestore } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "./AuthProvider";

const AddTransaction = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("entrata"); // Entrata o Uscita
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [method, setMethod] = useState("carta");
  const [notes, setNotes] = useState("");
  const [locationType, setLocationType] = useState("online");
  const [locationDetail, setLocationDetail] = useState("");

  const { currentUser } = useAuth();

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(firestore, "transactions"), {
        userId: currentUser.uid,
        name,
        type,
        amount: parseFloat(amount),
        date,
        method,
        notes,
        locationType,
        locationDetail,
      });

      // Resetta il form dopo l'invio
      setName("");
      setType("entrata");
      setAmount("");
      setDate("");
      setMethod("carta");
      setNotes("");
      setLocationType("online");
      setLocationDetail("");
    } catch (err) {
      console.error("Errore durante l'aggiunta della transazione:", err);
    }
  };

  return (
    <form onSubmit={handleAddTransaction}>
      <h3>Aggiungi Transazione</h3>
      <input
        type="text"
        placeholder="Nome della transazione"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="entrata">Entrata</option>
        <option value="uscita">Uscita</option>
      </select>
      <input
        type="number"
        placeholder="Importo"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <select value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="carta">Carta</option>
        <option value="contanti">Contanti</option>
        <option value="altro">Altro</option>
      </select>
      <textarea
        placeholder="Note"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Campo per il tipo di luogo */}
      <select
        value={locationType}
        onChange={(e) => setLocationType(e.target.value)}
      >
        <option value="online">Online (sito web, app, ecc.)</option>
        <option value="luogo">Luogo (Attività, città (provincia))</option>
      </select>

      {/* Campo per il dettaglio del luogo */}
      <input
        type="text"
        placeholder={
          locationType === "online"
            ? "Specifica sito web, app, ecc."
            : "Attività, città (provincia)"
        }
        value={locationDetail}
        onChange={(e) => setLocationDetail(e.target.value)}
        required
      />

      <button type="submit">Aggiungi Transazione</button>
    </form>
  );
};

export default AddTransaction;
