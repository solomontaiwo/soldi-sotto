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
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../../utils/firebase";
import { useNotification } from "../../utils/notificationUtils";
import PropTypes from "prop-types";
import { useTranslation } from 'react-i18next';

const UnifiedTransactionContext = createContext();

export const useUnifiedTransactions = () => useContext(UnifiedTransactionContext);
const DEMO_FLAG_KEY = "soldi-sotto-demo-enabled";

// Wrapper per provider Firebase
const FirebaseTransactionWrapper = ({ children }) => {
  FirebaseTransactionWrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };
  
  const { currentUser } = useAuth();
  const { transactions, loading } = useTransactions();
  const [isProcessing, setIsProcessing] = useState(false);
  const notification = useNotification();
  const { t } = useTranslation();

  // Aggiunge transazione Firebase
  const addTransaction = useCallback(async (transactionData) => {
    if (!currentUser) return false;
    
    setIsProcessing(true);
    try {
      await addDoc(collection(firestore, "transactions"), {
        userId: currentUser.uid,
        ...transactionData,
        createdAt: serverTimestamp(), // Salva timestamp di creazione
      });
      notification.success(t('notifications.addSuccess'));
      return true;
    } catch (error) {
      console.error("Errore nell'aggiunta della transazione:", error);
      notification.error(t('notifications.addError'));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser, t]);

  // Aggiorna transazione Firebase
  const updateTransaction = useCallback(async (transactionId, updatedData) => {
    if (!currentUser) return false;
    
    setIsProcessing(true);
    try {
      const transactionRef = doc(firestore, "transactions", transactionId);
      await updateDoc(transactionRef, updatedData);
      notification.success(t('notifications.updateSuccess'));
      return true;
    } catch (error) {
      console.error("Errore nell'aggiornamento della transazione:", error);
      notification.error(t('notifications.updateError'));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser, t]);

  // Elimina transazione Firebase
  const deleteTransaction = useCallback(async (transactionId) => {
    if (!currentUser) return false;
    
    setIsProcessing(true);
    try {
      const transactionRef = doc(firestore, "transactions", transactionId);
      await deleteDoc(transactionRef);
      notification.success(t('notifications.deleteSuccess'));
      return true;
    } catch (error) {
      console.error("Errore nell'eliminazione della transazione:", error);
      notification.error(t('notifications.deleteError'));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser, t]);

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
        startDemo: () => false,
        stopDemo: () => {},
      }}
    >
      {children}
    </UnifiedTransactionContext.Provider>
  );
};

// Wrapper per provider Demo
const DemoTransactionWrapper = ({ children, startDemo, seedDemo, stopDemo }) => {
  DemoTransactionWrapper.propTypes = {
    children: PropTypes.node.isRequired,
    startDemo: PropTypes.func.isRequired,
    seedDemo: PropTypes.bool,
    stopDemo: PropTypes.func.isRequired,
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
        startDemo,
        seedOnMount: seedDemo,
        stopDemo,
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
  const [demoEnabled, setDemoEnabled] = useState(() => {
    return localStorage.getItem(DEMO_FLAG_KEY) === "true";
  });
  const [seedDemo, setSeedDemo] = useState(false);

  const startDemo = useCallback(() => {
    localStorage.setItem(DEMO_FLAG_KEY, "true");
    setDemoEnabled(true);
    setSeedDemo(true);
    return true;
  }, []);

  const stopDemo = useCallback(() => {
    localStorage.removeItem(DEMO_FLAG_KEY);
    setDemoEnabled(false);
    setSeedDemo(false);
  }, []);

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
          startDemo,
          stopDemo,
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

  // Se l'utente non è autenticato ma ha attivato la demo, usa Demo
  if (demoEnabled) {
    return (
      <DemoProvider seedOnMount={seedDemo}>
        <DemoTransactionWrapper startDemo={startDemo} seedDemo={seedDemo} stopDemo={stopDemo}>
          {children}
        </DemoTransactionWrapper>
      </DemoProvider>
    );
  }

  // Nessun utente e demo non attivata: fornisce contesto neutro con azioni disabilitate
  return (
    <UnifiedTransactionContext.Provider
      value={{
        transactions: [],
        loading: false,
        addTransaction: () => Promise.resolve(false),
        updateTransaction: () => Promise.resolve(false),
        deleteTransaction: () => Promise.resolve(false),
        generateSampleTransactions: () => Promise.resolve(false),
        clearTransactions: () => {},
        canAddMoreTransactions: false,
        maxTransactions: 0,
        getStats: () => ({
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          transactionCount: 0,
          categoryBreakdown: {},
        }),
        isDemo: false,
        isAuthenticated: false,
        startDemo,
        seedOnMount: false,
        stopDemo,
      }}
    >
      {children}
    </UnifiedTransactionContext.Provider>
  );
};

export default UnifiedTransactionProvider; 
