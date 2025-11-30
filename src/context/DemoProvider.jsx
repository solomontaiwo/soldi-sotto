import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
      useRef,
    } from "react";
    import { useNotification } from "../utils/notificationUtils.jsx";
    import PropTypes from "prop-types";
    import { useTranslation } from 'react-i18next';

const DemoContext = createContext();

export const useDemo = () => useContext(DemoContext);

const DEMO_STORAGE_KEY = "soldi-sotto-demo-transactions";
export const MAX_DEMO_TRANSACTIONS = 10;

export const DemoProvider = ({ children, seedOnMount = false }) => {
  DemoProvider.propTypes = {
    children: PropTypes.node.isRequired,
    seedOnMount: PropTypes.bool,
  };

  const [demoTransactions, setDemoTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasSeededRef = useRef(false);
  const notification = useNotification();
  const { t } = useTranslation();

  // Load demo transactions from localStorage
  const loadDemoTransactions = useCallback(() => {
    try {
      const savedTransactions = localStorage.getItem(DEMO_STORAGE_KEY);
      if (savedTransactions) {
        const parsed = JSON.parse(savedTransactions);
        // Convert date strings to Date objects
        const transactions = parsed.map(transaction => ({
          ...transaction,
          date: new Date(transaction.date),
          amount: parseFloat(transaction.amount) || 0,
        }));
        // Sort by date descending
        transactions.sort((a, b) => b.date - a.date);
        setDemoTransactions(transactions);
      }
    } catch (error) {
      console.error("Error loading demo transactions:", error);
      setDemoTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save demo transactions to localStorage
  const saveDemoTransactions = useCallback((transactions) => {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error("Error saving demo transactions:", error);
    }
  }, []);

  // Adds a new demo transaction
  const addDemoTransaction = useCallback(async (transactionData) => {
    const userTransactionCount = demoTransactions.filter(t => !t.isSample).length;
    if (userTransactionCount >= MAX_DEMO_TRANSACTIONS) {
      notification.warning(t('demo.limitReached', { limit: MAX_DEMO_TRANSACTIONS }));
      return false;
    }

    const newTransaction = {
      ...transactionData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      isSample: false, 
    };

    const updatedTransactions = [newTransaction, ...demoTransactions];
    setDemoTransactions(updatedTransactions);
    saveDemoTransactions(updatedTransactions);
    
    notification.success(t('demo.transactionAdded'));
    return true;
  }, [demoTransactions, saveDemoTransactions, notification, t]);

  // Updates an existing demo transaction
  const updateDemoTransaction = useCallback(async (transactionId, updatedData) => {
    const updatedTransactions = demoTransactions.map(transaction =>
      transaction.id === transactionId
        ? { ...transaction, ...updatedData }
        : transaction
    );
    setDemoTransactions(updatedTransactions);
    saveDemoTransactions(updatedTransactions);
    notification.success(t('demo.transactionUpdated'));
    return true;
  }, [demoTransactions, saveDemoTransactions, notification, t]);

  // Deletes a demo transaction
  const deleteDemoTransaction = useCallback(async (transactionId) => {
    const updatedTransactions = demoTransactions.filter(
      transaction => transaction.id !== transactionId
    );
    setDemoTransactions(updatedTransactions);
    saveDemoTransactions(updatedTransactions);
    notification.success(t('demo.transactionDeleted'));
    return true;
  }, [demoTransactions, saveDemoTransactions, notification, t]);

  // Clears all demo transactions
  const clearDemoTransactions = useCallback(() => {
    setDemoTransactions([]);
    localStorage.removeItem(DEMO_STORAGE_KEY);
    notification.success(t('demo.allTransactionsCleared'));
  }, [notification, t]);

  // Checks if user can add more transactions (excluding samples)
  const canAddMoreTransactions = demoTransactions.filter(t => !t.isSample).length < MAX_DEMO_TRANSACTIONS;

  // Demo statistics
  const getDemoStats = useCallback(() => {
    const totalIncome = demoTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = demoTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const userTransactionCount = demoTransactions.filter(t => !t.isSample).length;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: userTransactionCount,
      maxTransactions: MAX_DEMO_TRANSACTIONS,
      canAddMore: userTransactionCount < MAX_DEMO_TRANSACTIONS,
    };
  }, [demoTransactions]);

  // Generate some sample transactions if none exist
  const generateSampleTransactions = useCallback(() => {
    const today = new Date();
    const sampleTransactions = [
      {
        id: "demo-1",
        type: "income",
        amount: 2500,
        description: t('demo.sampleSalary'),
        date: today,
        category: "stipendio",
        createdAt: new Date(),
        isSample: true,
      },
      {
        id: "demo-2",
        type: "expense",
        amount: 50,
        description: t('demo.sampleGroceries'),
        date: today,
        category: "supermercato",
        createdAt: new Date(),
        isSample: true,
      },
      {
        id: "demo-3",
        type: "expense",
        amount: 25,
        description: t('demo.sampleFuel'),
        date: today,
        category: "trasporti",
        createdAt: new Date(),
        isSample: true,
      },
    ];

    setDemoTransactions(sampleTransactions);
    saveDemoTransactions(sampleTransactions);
    notification.info(t('demo.sampleTransactionsAdded'));
  }, [saveDemoTransactions, notification, t]);

  useEffect(() => {
    loadDemoTransactions();
  }, [loadDemoTransactions]);

  // If demo was just activated and no transactions exist, generate samples
  useEffect(() => {
    if (seedOnMount && !hasSeededRef.current) {
      if (demoTransactions.length === 0) {
        generateSampleTransactions();
      }
      hasSeededRef.current = true;
    }
  }, [seedOnMount, demoTransactions.length, generateSampleTransactions]);

  return (
    <DemoContext.Provider
      value={{
        // Dati
        transactions: demoTransactions,
        loading,
        
        // Azioni
        addTransaction: addDemoTransaction,
        updateTransaction: updateDemoTransaction,
        deleteTransaction: deleteDemoTransaction,
        clearTransactions: clearDemoTransactions,
        generateSampleTransactions,
        
        // Utilities
        canAddMoreTransactions,
        maxTransactions: MAX_DEMO_TRANSACTIONS,
        getDemoStats,
        
        // Flags
        isDemo: true,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export default DemoProvider;