import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "./AuthProvider";
import AddTransaction from "./AddTransaction";
import jsPDF from "jspdf";
import { format } from "date-fns";
import "./TransactionList.css";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("giorno");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const fetchTransactions = async () => {
        let q = query(
          collection(firestore, "transactions"),
          where("userId", "==", currentUser.uid),
          orderBy("date", "desc")
        );

        if (startDate && endDate) {
          q = query(
            q,
            where("date", ">=", startDate),
            where("date", "<=", endDate)
          );
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const data = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setTransactions(data);
        });

        return () => unsubscribe();
      };

      fetchTransactions();
    }
  }, [currentUser, startDate, endDate]);

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.name.includes(filter) ||
      tx.type.includes(filter) ||
      tx.method.includes(filter) ||
      tx.location?.includes(filter)
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const formattedDate = format(now, "yyyy-MM-dd_HH-mm-ss");
    const periodLabel =
      {
        giorno: "Giornaliero",
        settimana: "Settimanale",
        mese: "Mensile",
        anno: "Annuale",
        personalizzato: `Personalizzato (${startDate} - ${endDate})`,
      }[selectedPeriod] || "Report";

    const fileName = `${periodLabel}_report-${
      currentUser.displayName || "utente"
    }-${formattedDate}-soldisotto.pdf`;

    doc.text(`Report delle Transazioni (${periodLabel})`, 10, 10);
    filteredTransactions.forEach((tx, index) => {
      doc.text(
        `${index + 1}. ${tx.name} - ${tx.type} - ${tx.date} - ${
          tx.location || "Non specificato"
        }`,
        10,
        20 + index * 10
      );
    });
    doc.save(fileName);
  };

  return (
    <div className="transaction-list-container">
      <header className="transaction-header">
        <h2>Transazioni</h2>
        <AddTransaction />
      </header>
      <div className="filter-options">
        <label>
          Seleziona periodo:
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="giorno">Giorno</option>
            <option value="settimana">Settimana</option>
            <option value="mese">Mese</option>
            <option value="anno">Anno</option>
            <option value="personalizzato">Personalizzato</option>
          </select>
        </label>
        {selectedPeriod === "personalizzato" && (
          <div className="date-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Data inizio"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Data fine"
            />
          </div>
        )}
        <button className="generate-report-btn" onClick={generatePDF}>
          Genera Report PDF
        </button>
      </div>
      <input
        type="text"
        placeholder="Cerca..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="search-input"
      />
      <ul className="transaction-list">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <li key={tx.id} className="transaction-item">
              <p>
                <strong>Nome:</strong> {tx.name}
              </p>
              <p>
                <strong>Tipo:</strong> {tx.type}
              </p>
              <p>
                <strong>Data:</strong> {tx.date}
              </p>
              <p>
                <strong>Metodo:</strong> {tx.method}
              </p>
              <p>
                <strong>Luogo:</strong> {tx.location || "Non specificato"}
              </p>
              <p>
                <strong>Note:</strong> {tx.notes}
              </p>
            </li>
          ))
        ) : (
          <p>Non ci sono transazioni</p>
        )}
      </ul>
    </div>
  );
};

export default TransactionList;
