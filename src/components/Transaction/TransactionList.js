import React, { useState, useEffect } from "react";
import { firestore } from "../../firebase";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../Auth/AuthProvider";
import { Link } from "react-router-dom";
import "./TransactionList.css";

const TransactionList = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
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
            orderBy("date", "desc")
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

  const handleEditClick = (transaction) => {
    setEditTransaction(transaction);
  };

  const handleSaveChanges = async () => {
    if (editTransaction) {
      const transactionRef = doc(firestore, "transactions", editTransaction.id);
      try {
        await updateDoc(transactionRef, {
          amount: editTransaction.amount,
          description: editTransaction.description,
          place: editTransaction.place,
          paymentMethod: editTransaction.paymentMethod,
        });
        setEditTransaction(null); // Esce dalla modalità di modifica
      } catch (error) {
        setError("Errore durante l'aggiornamento della transazione.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditTransaction((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };


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
              {editTransaction && editTransaction.id === transaction.id ? (
                <div className="edit-transaction">
                  <label>
                    Importo:
                    <input
                      type="number"
                      name="amount"
                      value={editTransaction.amount}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Descrizione:
                    <input
                      type="text"
                      name="description"
                      value={editTransaction.description || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Luogo:
                    <input
                      type="text"
                      name="place"
                      value={editTransaction.place || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Metodo di Pagamento:
                    <input
                      type="text"
                      name="paymentMethod"
                      value={editTransaction.paymentMethod || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <button onClick={handleSaveChanges}>Salva</button>
                  <button onClick={() => setEditTransaction(null)}>Annulla</button>
                </div>
              ) : (
                <>
                  <h4>{new Date(transaction.date.toDate()).toLocaleDateString()}</h4>
                  <p>
                    <strong>Tipo:</strong>
                    <span className={transaction.type === "income" ? "income" : "expense"}>
                      {transaction.type === "income" ? "Entrata" : "Uscita"}
                    </span>
                  </p>
                  <p>
                    <strong>Importo:</strong> {Number(transaction.amount).toFixed(2)} €
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
                  <button onClick={() => handleEditClick(transaction)}>Modifica</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
