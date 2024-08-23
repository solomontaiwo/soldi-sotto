import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "./AuthProvider";
import { firestore } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Chart from "react-apexcharts";
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
import "./Statistics.css";

const Statistics = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [viewMode, setViewMode] = useState("monthly"); // monthly, weekly, daily

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

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

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
    <div className="stats-container">
      <header className="stats-header">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Statistiche Finanziarie
        </motion.h1>
        <p>Visualizza e gestisci le tue statistiche in base al periodo selezionato.</p>
      </header>
      <div className="stats-controls">
        <button onClick={() => handleViewModeChange("daily")}>
          Giornaliero
        </button>
        <button onClick={() => handleViewModeChange("weekly")}>
          Settimanale
        </button>
        <button onClick={() => handleViewModeChange("monthly")}>
          Mensile
        </button>
        <button onClick={generatePDF}>Genera PDF</button>
      </div>
      <div className="chart-container">
        <Chart options={options} series={series} type="pie" width="100%" />
      </div>
      <div className="stat-item">
        <h2>Entrate Totali</h2>
        <p>{stats.totalIncome.toFixed(2)} €</p>
      </div>
      <div className="stat-item">
        <h2>Spese Totali</h2>
        <p>{stats.totalExpense.toFixed(2)} €</p>
      </div>
      <div className="stat-item">
        <h2>Saldo</h2>
        <p>{stats.balance.toFixed(2)} €</p>
      </div>
    </div>
  );
};

export default Statistics;