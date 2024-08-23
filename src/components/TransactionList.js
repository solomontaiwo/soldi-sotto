import React, { useState, useEffect } from "react";
import { firestore } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";
import "./TransactionList.css";

const TransactionList = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const fetchTransactions = async () => {
        try {
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

          const q = query(
            collection(firestore, "transactions"),
            where("userId", "==", currentUser.uid),
            where("date", ">=", startOfMonth),
            where("date", "<=", endOfMonth),
            orderBy("date", "desc") // Ordinamento per data decrescente
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            setTransactions(data);
          });

          return () => unsubscribe();
        } catch (err) {
          setError(err.message);
        }
      };

      fetchTransactions();
    }
  }, [currentUser]);

  return (
    <div className="transaction-list">
      <h2>Lista Transazioni</h2>
      {error && <p className="error-message">{error}</p>}
      {transactions.length === 0 ? (
        <p className="no-transactions-message">
          Nessuna transazione registrata, vai alla <Link to="/soldi-sotto">home</Link> per inserirne.
        </p>
      ) : (
        <div className="transaction-cards">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-card">
              <h4>{new Date(transaction.date.toDate()).toLocaleDateString()}</h4>
              <p>
                <strong>Tipo:</strong> {transaction.type === "income" ? "Entrata" : "Uscita"}
              </p>
              <p>
                <strong>Importo:</strong> {transaction.amount.toFixed(2)} €
              </p>
              <p>
                <strong>Descrizione:</strong> {transaction.description || "-"}
              </p>
              <p>
                <strong>Luogo:</strong> {transaction.place || "-"}
              </p>
              <p>
                <strong>Metodo di Pagamento:</strong> {transaction.paymentMethod || "-"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
