import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "../Auth/AuthProvider";
import { TransactionProvider, useTransactions } from "./TransactionProvider";
import { DemoProvider, useDemo } from "./DemoProvider";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "../../utils/firebase";
import { useNotification } from "../../utils/notificationUtils";
import PropTypes from "prop-types";

const UnifiedTransactionContext = createContext();

export const useUnifiedTransactions = () => useContext(UnifiedTransactionContext);

// Wrapper per provider Firebase
const FirebaseTransactionWrapper = ({ children }) => {
  FirebaseTransactionWrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };
  
  const { currentUser } = useAuth();
  const { transactions, loading } = useTransactions();
  const [isProcessing, setIsProcessing] = useState(false);
  const notification = useNotification();

  // Aggiunge transazione Firebase
  const addTransaction = useCallback(async (transactionData) => {
    if (!currentUser) return false;
    
    setIsProcessing(true);
    try {
      await addDoc(collection(firestore, "transactions"), {
        userId: currentUser.uid,
        ...transactionData,
      });
      notification.success("Transazione aggiunta con successo!");
      return true;
    } catch (error) {
      console.error("Errore nell'aggiunta della transazione:", error);
      notification.error("Errore nell'aggiunta della transazione");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser]);

  // Aggiorna transazione Firebase
  const updateTransaction = useCallback(async (transactionId, updatedData) => {
    if (!currentUser) return false;
    
    setIsProcessing(true);
    try {
      const transactionRef = doc(firestore, "transactions", transactionId);
      await updateDoc(transactionRef, updatedData);
      notification.success("Transazione aggiornata con successo!");
      return true;
    } catch (error) {
      console.error("Errore nell'aggiornamento della transazione:", error);
      notification.error("Errore nell'aggiornamento della transazione");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser]);

  // Elimina transazione Firebase
  const deleteTransaction = useCallback(async (transactionId) => {
    if (!currentUser) return false;
    
    setIsProcessing(true);
    try {
      const transactionRef = doc(firestore, "transactions", transactionId);
      await deleteDoc(transactionRef);
      notification.success("Transazione eliminata con successo!");
      return true;
    } catch (error) {
      console.error("Errore nell'eliminazione della transazione:", error);
      notification.error("Errore nell'eliminazione della transazione");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser]);

  // Statistiche Firebase
  const getStats = useCallback(() => {
    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
      canAddMore: true, // Nessun limite per utenti registrati
    };
  }, [transactions]);

  return (
    <UnifiedTransactionContext.Provider
      value={{
        // Dati
        transactions,
        loading: loading || isProcessing,
        
        // Azioni
        addTransaction,
        updateTransaction,
        deleteTransaction,
        
        // Utilities
        canAddMoreTransactions: true,
        maxTransactions: Infinity,
        getStats,
        
        // Flags
        isDemo: false,
        isAuthenticated: true,
      }}
    >
      {children}
    </UnifiedTransactionContext.Provider>
  );
};

// Wrapper per provider Demo
const DemoTransactionWrapper = ({ children }) => {
  DemoTransactionWrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };
  
  const {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    canAddMoreTransactions,
    maxTransactions,
    getDemoStats,
    generateSampleTransactions,
    clearTransactions,
  } = useDemo();

  return (
    <UnifiedTransactionContext.Provider
      value={{
        // Dati
        transactions,
        loading,
        
        // Azioni
        addTransaction,
        updateTransaction,
        deleteTransaction,
        generateSampleTransactions,
        clearTransactions,
        
        // Utilities
        canAddMoreTransactions,
        maxTransactions,
        getStats: getDemoStats,
        
        // Flags
        isDemo: true,
        isAuthenticated: false,
      }}
    >
      {children}
    </UnifiedTransactionContext.Provider>
  );
};

// Provider principale unificato
export const UnifiedTransactionProvider = ({ children }) => {
  UnifiedTransactionProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const { currentUser, loading: authLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Aspetta che l'autenticazione sia completata
    if (!authLoading) {
      setIsReady(true);
    }
  }, [authLoading]);

  if (!isReady) {
    return (
      <UnifiedTransactionContext.Provider
        value={{
          transactions: [],
          loading: true,
          addTransaction: () => Promise.resolve(false),
          updateTransaction: () => Promise.resolve(false),
          deleteTransaction: () => Promise.resolve(false),
          canAddMoreTransactions: false,
          maxTransactions: 0,
          getStats: () => ({}),
          isDemo: false,
          isAuthenticated: false,
        }}
      >
        {children}
      </UnifiedTransactionContext.Provider>
    );
  }

  // Se l'utente è autenticato, usa Firebase
  if (currentUser) {
    return (
      <TransactionProvider>
        <FirebaseTransactionWrapper>
          {children}
        </FirebaseTransactionWrapper>
      </TransactionProvider>
    );
  }

  // Se l'utente non è autenticato, usa Demo
  return (
    <DemoProvider>
      <DemoTransactionWrapper>
        {children}
      </DemoTransactionWrapper>
    </DemoProvider>
  );
};

export default UnifiedTransactionProvider; 