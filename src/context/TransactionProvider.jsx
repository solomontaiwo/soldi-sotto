import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
  import { useAuth } from "./AuthProvider";
  import PropTypes from "prop-types";
  import { TransactionService } from "../services/transactionService.jsx";
  
  const TransactionContext = createContext();
export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  TransactionProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent transactions for the UI (limit 50)
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setTransactions([]);
      return;
    }

    setLoading(true);
    
    // Use service to subscribe to recent transactions
    const unsubscribe = TransactionService.subscribeToRecent(
      currentUser.uid, 
      50, // Limit to 50 for performance
      (data) => {
        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Expose a way to fetch all transactions for analytics if needed
  const fetchAllTransactions = useCallback(async () => {
    if (!currentUser) return [];
    return await TransactionService.fetchAll(currentUser.uid);
  }, [currentUser]);

  const getTotalTransactionCount = useCallback(async () => {
    if (!currentUser) return 0;
    return await TransactionService.getTotalCount(currentUser.uid);
  }, [currentUser]);

  return (
    <TransactionContext.Provider value={{ transactions, loading, fetchAllTransactions, getTotalTransactionCount }}>
      {children}
    </TransactionContext.Provider>
  );
};
