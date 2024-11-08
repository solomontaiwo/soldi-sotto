import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TransactionList from "../Transaction/TransactionList";
import TransactionForm from "../Transaction/TransactionForm";
import { useAuth } from "../Auth/AuthProvider";
import { firestore } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
} from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Home.css";

const Home = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  // eslint-disable-next-line
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [viewMode, setViewMode] = useState("monthly");

  useEffect(() => {
    if (currentUser) {
      const fetchTransactions = async () => {
        let startDate, endDate;
        const today = new Date();

        if (viewMode === "monthly") {
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
        } else if (viewMode === "weekly") {
          startDate = startOfWeek(today);
          endDate = endOfWeek(today);
        } else if (viewMode === "daily") {
          startDate = startOfDay(today);
          endDate = endOfDay(today);
        }

        const q = query(
          collection(firestore, "transactions"),
          where("userId", "==", currentUser.uid),
          where("date", ">=", startDate),
          where("date", "<=", endDate)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const data = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setTransactions(data);
          calculateStats(data);
        });

        return () => unsubscribe();
      };

      fetchTransactions();
    }
  }, [currentUser, viewMode]);

  const calculateStats = (transactions) => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") totalIncome += tx.amount;
      if (tx.type === "expense") totalExpense += tx.amount;
    });

    setStats({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  };

  // eslint-disable-next-line
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // eslint-disable-next-line
  const generatePDF = () => {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "");

    const reportType =
      viewMode === "daily"
        ? "giornaliero"
        : viewMode === "weekly"
        ? "settimanale"
        : viewMode === "monthly"
        ? "mensile"
        : "annuale";

    const userName = currentUser.displayName
      ? currentUser.displayName.replace(/\s+/g, "-")
      : "nomeutente";

    const fileName = `[${formattedDate}]report-${reportType}-${userName}-soldisotto.pdf`;

    const doc = new jsPDF();
    doc.text("Statistiche Finanziarie", 14, 16);

    const statsTable = transactions.map((tx) => [
      tx.date.toDate().toLocaleDateString(),
      tx.description,
      tx.amount.toFixed(2),
      tx.type === "income" ? "Entrata" : "Uscita",
      tx.place || "-",
      tx.paymentMethod || "-",
    ]);

    doc.autoTable({
      head: [
        [
          "Data",
          "Descrizione",
          "Importo",
          "Tipo",
          "Luogo",
          "Metodo di Pagamento",
        ],
      ],
      body: statsTable,
    });

    doc.save(fileName);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Benvenuto in SoldiSotto!
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Gestisci le tue finanze in modo semplice e veloce.
        </motion.p>
      </header>
      {currentUser && (
        <div className="home-content">
          <TransactionForm />
          <div className="transaction-list-container">
            <TransactionList />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
