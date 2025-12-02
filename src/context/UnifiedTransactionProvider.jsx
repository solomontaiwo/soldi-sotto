import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthProvider.jsx";
import { TransactionProvider, useTransactions } from "./TransactionProvider.jsx";
import { DemoProvider, useDemo, MAX_DEMO_TRANSACTIONS } from "./DemoProvider.jsx";
import { useNotification } from "../utils/notificationUtils.jsx";
import PropTypes from "prop-types";
import { useTranslation } from 'react-i18next';
import { TransactionService } from "../services/transactionService.jsx";

const UnifiedTransactionContext = createContext({
  transactions: [],
  loading: true,
  addTransaction: async () => false,
  updateTransaction: async () => false,
  deleteTransaction: async () => false,
  fetchAllTransactions: async () => [],
  getTotalTransactionCount: async () => 0,
  canAddMoreTransactions: false,
  maxTransactions: 0,
  getStats: () => ({}),
  isDemo: false,
  isAuthenticated: false,
  startDemo: () => false,
  stopDemo: () => {},
});

export const useUnifiedTransactions = () => useContext(UnifiedTransactionContext);
const DEMO_FLAG_KEY = "soldi-sotto-demo-enabled";

// Wrapper for Firebase provider
const FirebaseTransactionWrapper = ({ children }) => {
  FirebaseTransactionWrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };
  
  const { currentUser } = useAuth();
  const { transactions, loading, fetchAllTransactions, getTotalTransactionCount } = useTransactions();
  const [isProcessing, setIsProcessing] = useState(false);
  const notification = useNotification();
  const { t } = useTranslation();

  // Adds Firebase transaction
  const addTransaction = useCallback(async (transactionData) => {
    if (!currentUser) return false;
    
    setIsProcessing(true);
    try {
      await TransactionService.add(currentUser.uid, transactionData);
      notification.success(t('notifications.addSuccess'));
      return true;
    } catch (error) {
      console.error("Error adding transaction:", error);
      // Check for Zod validation errors
      if (error.issues) {
         notification.error(error.issues[0].message);
      } else {
         notification.error(t('notifications.addError'));
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser, t]);

  // Updates Firebase transaction
  const updateTransaction = useCallback(async (transactionId, updatedData) => {
    if (!currentUser) return false;
    
    setIsProcessing(true);
    try {
      await TransactionService.update(transactionId, updatedData);
      notification.success(t('notifications.updateSuccess'));
      return true;
    } catch (error) {
      console.error("Error updating transaction:", error);
      notification.error(t('notifications.updateError'));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser, t]);

  // Deletes Firebase transaction
  const deleteTransaction = useCallback(async (transactionId) => {
    if (!currentUser) return false;
    
    setIsProcessing(true);
    try {
      await TransactionService.delete(transactionId);
      notification.success(t('notifications.deleteSuccess'));
      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      notification.error(t('notifications.deleteError'));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser, t]);

  // Firebase Statistics
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
      canAddMore: true, // No limit for registered users
    };
  }, [transactions]);

  return (
    <UnifiedTransactionContext.Provider
      value={{
        // Data
        transactions,
        loading: loading || isProcessing,
        
        // Actions
        addTransaction,
        updateTransaction,
        deleteTransaction,
        fetchAllTransactions, // Expose specifically for analytics
        
        // Utilities
        canAddMoreTransactions: true,
        maxTransactions: Infinity,
        getStats,
        getTotalTransactionCount,
        
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

// Wrapper for Demo provider
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

  // Mock fetchAllTransactions for demo (just returns what we have)
  const fetchAllTransactions = useCallback(async (_options = {}) => {
    return transactions;
  }, [transactions]);

  // Mock getTotalTransactionCount for demo
  const getTotalTransactionCount = useCallback(async (_options = {}) => {
    return transactions.length;
  }, [transactions]);

  return (
    <UnifiedTransactionContext.Provider
      value={{
        // Data
        transactions,
        loading,
        
        // Actions
        addTransaction,
        updateTransaction,
        deleteTransaction,
        generateSampleTransactions,
        clearTransactions,
        fetchAllTransactions,
        
        // Utilities
        canAddMoreTransactions,
        maxTransactions: MAX_DEMO_TRANSACTIONS, // Corrected to use the actual demo max
        getStats: getDemoStats,
        getTotalTransactionCount,
        
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

// Main unified provider
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
    // Wait for authentication to complete
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
          fetchAllTransactions: async (_options = {}) => [],
          getTotalTransactionCount: async () => 0,
        }}
      >
        {children}
      </UnifiedTransactionContext.Provider>
    );
  }

  // If user is authenticated, use Firebase
  if (currentUser) {
    return (
      <TransactionProvider>
        <FirebaseTransactionWrapper>
          {children}
        </FirebaseTransactionWrapper>
      </TransactionProvider>
    );
  }

  // If user is not authenticated but demo is enabled, use Demo
  if (demoEnabled) {
    return (
      <DemoProvider seedOnMount={seedDemo}>
        <DemoTransactionWrapper startDemo={startDemo} seedDemo={seedDemo} stopDemo={stopDemo}>
          {children}
        </DemoTransactionWrapper>
      </DemoProvider>
    );
  }

  // No user and demo not enabled: provides neutral context with disabled actions
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
        fetchAllTransactions: async (_options = {}) => [],
        getTotalTransactionCount: async () => 0,
      }}
    >
      {children}
    </UnifiedTransactionContext.Provider>
  );
};

export default UnifiedTransactionProvider;
