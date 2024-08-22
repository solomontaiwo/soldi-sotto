import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "./AuthProvider";
import jsPDF from "jspdf";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        console.error("Utente non autenticato");
        return;
      }
      try {
        const q = query(
          collection(firestore, "transactions"),
          where("userId", "==", currentUser.uid),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        setTransactions(
          querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      } catch (error) {
        console.error("Errore durante il recupero delle transazioni:", error);
      }
    };
    fetchData();
  }, [currentUser]);

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.name.includes(filter) ||
      tx.type.includes(filter) ||
      tx.method.includes(filter)
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Report delle Transazioni", 10, 10);
    filteredTransactions.forEach((tx, index) => {
      doc.text(
        `${index + 1}. ${tx.name} - ${tx.type} - ${tx.date}`,
        10,
        20 + index * 10
      );
    });
    doc.save("report.pdf");
  };

  return (
    <div>
      <h2>Transazioni</h2>
      <button onClick={generatePDF}>Genera Report PDF</button>
      <input
        type="text"
        placeholder="Cerca..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {filteredTransactions.map((tx) => (
          <li key={tx.id}>
            <p>Nome: {tx.name}</p>
            <p>Tipo: {tx.type}</p>
            <p>Data: {tx.date}</p>
            <p>Metodo: {tx.method}</p>
            <p>Note: {tx.notes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;
