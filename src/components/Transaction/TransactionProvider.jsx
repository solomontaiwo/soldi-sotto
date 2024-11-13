import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { firestore } from "../../utils/firebase";
import { useAuth } from "../Auth/AuthProvider";

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(() => {
    if (!currentUser) return;

    setLoading(true);
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const q = query(
      collection(firestore, "transactions"),
      where("userId", "==", currentUser.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        amount: parseFloat(doc.data().amount) || 0,
      }));
      setTransactions(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = fetchTransactions();
      return () => unsubscribe && unsubscribe();
    } else {
      setLoading(false);
    }
  }, [currentUser, fetchTransactions]);

  return (
    <TransactionContext.Provider value={{ transactions, loading }}>
      {children}
    </TransactionContext.Provider>
  );
};
