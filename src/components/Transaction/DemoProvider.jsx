import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNotification } from "../../utils/notificationUtils";
import PropTypes from "prop-types";

const DemoContext = createContext();

export const useDemo = () => useContext(DemoContext);

const DEMO_STORAGE_KEY = "soldi-sotto-demo-transactions";
const MAX_DEMO_TRANSACTIONS = 10;

export const DemoProvider = ({ children }) => {
  DemoProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const [demoTransactions, setDemoTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const notification = useNotification();

  // Carica le transazioni demo dal localStorage
  const loadDemoTransactions = useCallback(() => {
    try {
      const savedTransactions = localStorage.getItem(DEMO_STORAGE_KEY);
      if (savedTransactions) {
        const parsed = JSON.parse(savedTransactions);
        // Converte le date da string a oggetti Date
        const transactions = parsed.map(transaction => ({
          ...transaction,
          date: new Date(transaction.date),
          amount: parseFloat(transaction.amount) || 0,
        }));
        // Ordina per data decrescente
        transactions.sort((a, b) => b.date - a.date);
        setDemoTransactions(transactions);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle transazioni demo:", error);
      setDemoTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salva le transazioni demo nel localStorage
  const saveDemoTransactions = useCallback((transactions) => {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error("Errore nel salvataggio delle transazioni demo:", error);
    }
  }, []);

  // Aggiunge una nuova transazione demo
  const addDemoTransaction = useCallback(async (transactionData) => {
    if (demoTransactions.length >= MAX_DEMO_TRANSACTIONS) {
      notification.warning(`Hai raggiunto il limite di ${MAX_DEMO_TRANSACTIONS} transazioni nella modalità demo. Registrati per funzionalità complete!`);
      return false;
    }

    const newTransaction = {
      ...transactionData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };

    const updatedTransactions = [newTransaction, ...demoTransactions];
    setDemoTransactions(updatedTransactions);
    saveDemoTransactions(updatedTransactions);
    
    notification.success("Transazione aggiunta in modalità demo!");
    return true;
  }, [demoTransactions, saveDemoTransactions, notification]);

  // Aggiorna una transazione demo esistente
  const updateDemoTransaction = useCallback(async (transactionId, updatedData) => {
    const updatedTransactions = demoTransactions.map(transaction =>
      transaction.id === transactionId
        ? { ...transaction, ...updatedData }
        : transaction
    );
    setDemoTransactions(updatedTransactions);
    saveDemoTransactions(updatedTransactions);
    notification.success("Transazione aggiornata!");
    return true;
  }, [demoTransactions, saveDemoTransactions, notification]);

  // Elimina una transazione demo
  const deleteDemoTransaction = useCallback(async (transactionId) => {
    const updatedTransactions = demoTransactions.filter(
      transaction => transaction.id !== transactionId
    );
    setDemoTransactions(updatedTransactions);
    saveDemoTransactions(updatedTransactions);
    notification.success("Transazione eliminata!");
    return true;
  }, [demoTransactions, saveDemoTransactions, notification]);

  // Pulisce tutte le transazioni demo
  const clearDemoTransactions = useCallback(() => {
    setDemoTransactions([]);
    localStorage.removeItem(DEMO_STORAGE_KEY);
    notification.success("Tutte le transazioni demo sono state rimosse!");
  }, [notification]);

  // Controlla se l'utente può aggiungere più transazioni
  const canAddMoreTransactions = demoTransactions.length < MAX_DEMO_TRANSACTIONS;

  // Statistiche demo
  const getDemoStats = useCallback(() => {
    const totalIncome = demoTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = demoTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: demoTransactions.length,
      maxTransactions: MAX_DEMO_TRANSACTIONS,
      canAddMore: canAddMoreTransactions,
    };
  }, [demoTransactions, canAddMoreTransactions]);

  useEffect(() => {
    loadDemoTransactions();
  }, [loadDemoTransactions]);

  // Genera alcune transazioni demo se non ce ne sono
  const generateSampleTransactions = useCallback(() => {
    const sampleTransactions = [
      {
        id: "demo-1",
        type: "income",
        amount: 2500,
        description: "Stipendio",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        category: "salary",
        createdAt: new Date(),
      },
      {
        id: "demo-2",
        type: "expense",
        amount: 50,
        description: "Spesa alimentare",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        category: "groceries",
        createdAt: new Date(),
      },
      {
        id: "demo-3",
        type: "expense",
        amount: 25,
        description: "Benzina",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        category: "transport",
        createdAt: new Date(),
      },
    ];

    setDemoTransactions(sampleTransactions);
    saveDemoTransactions(sampleTransactions);
    notification.info("Sono state aggiunte alcune transazioni di esempio!");
  }, [saveDemoTransactions, notification]);

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