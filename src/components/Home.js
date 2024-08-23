import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TransactionList from "./TransactionList";
import TransactionForm from "./TransactionForm"; // Importa il componente corretto
import { useAuth } from "./AuthProvider";
import { firestore } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Chart from "react-apexcharts";
import "./Home.css";

const Home = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  useEffect(() => {
    if (currentUser) {
      const fetchTransactions = async () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );

        const q = query(
          collection(firestore, "transactions"),
          where("userId", "==", currentUser.uid),
          where("date", ">=", startOfMonth),
          where("date", "<=", endOfMonth)
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
  }, [currentUser]);

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

  const options = {
    chart: {
      type: "pie",
    },
    labels: ["Income", "Expense"],
    colors: ["#4caf50", "#f44336"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 320,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const series = [stats.totalIncome, stats.totalExpense];

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
        <p>Gestisci le tue finanze in modo semplice e veloce.</p>
      </header>
      {currentUser && (
        <div className="home-stats">
          <h2>Statistiche Mensili</h2>
          <div className="stats-container">
            <motion.div
              className="stat-item"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3>Entrate Totali</h3>
              <p>{stats.totalIncome.toFixed(2)} €</p>
            </motion.div>
            <motion.div
              className="stat-item"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3>Uscite Totali</h3>
              <p>{stats.totalExpense.toFixed(2)} €</p>
            </motion.div>
            <motion.div
              className="stat-item"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3>Saldo</h3>
              <p>{stats.balance.toFixed(2)} €</p>
            </motion.div>
          </div>
          <motion.div
            className="chart-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Chart options={options} series={series} type="pie" width="400" />
          </motion.div>
          <TransactionForm /> {/* Usa il componente combinato */}
          <div className="transaction-list-container">
            <TransactionList />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
