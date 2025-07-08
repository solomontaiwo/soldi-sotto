import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { firestore } from "../../utils/firebase";
import { useAuth } from "../Auth/AuthProvider";
import PropTypes from "prop-types";

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  TransactionProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(() => {
    if (!currentUser) return;

    setLoading(true);

    const q = query(
      collection(firestore, "transactions"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc") // Ordina per data/ora di creazione
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
