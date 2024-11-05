import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../Auth/AuthProvider";
import { firestore } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Chart from "react-apexcharts";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
} from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Stats.css";

const Stats = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [viewMode, setViewMode] = useState("monthly"); // annually, monthly, weekly, daily

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
        } else if (viewMode === "annually") {
          startDate = startOfYear(today);
          endDate = endOfYear(today);
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
        : viewMode === "annually"
        ? "annuale"
        : "sempre";

    let periodText = "";
    if (viewMode === "daily") {
      periodText = today.toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (viewMode === "weekly") {
      const startOfWeek = today.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const endOfWeek = new Date(
        today.setDate(today.getDate() + 6)
      ).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      periodText = `${startOfWeek} / ${endOfWeek}`;
    } else if (viewMode === "monthly") {
      periodText = today.toLocaleDateString("it-IT", {
        month: "long",
        year: "numeric",
      });
    } else if (viewMode === "annually") {
      periodText = today.getFullYear();
    }

    const userName = currentUser.displayName
      ? currentUser.displayName.replace(/\s+/g, "-")
      : "nomeutente";

    const fileName = `[${formattedDate}]report-${reportType}-${userName}-soldisotto.pdf`;

    const doc = new jsPDF();

    // TODO: inserire nome utente nel titolo
    // Imposta la dimensione del font per il titolo
    doc.setFontSize(22); // Dimensione del font più grande per il titolo
    doc.text(`Statistiche Finanziarie [${periodText}]`, 14, 16);
    doc.setFontSize(12); // Dimensione normale per il resto del testo

    // Tabella delle transazioni
    const statsTable = transactions.map((tx) => [
      tx.date.toDate().toLocaleDateString(),
      tx.description,
      tx.amount.toFixed(2),
      tx.type === "income" ? "Entrata" : "Uscita",
      tx.place || "-",
      tx.paymentMethod || "-",
    ]);

    doc.autoTable({
      startY: 24, // Aggiunge spazio extra tra il titolo e la tabella
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

    // Calcolo delle statistiche aggiuntive
    const totalTransactions = transactions.length;
    const averageSpendingPerDay = (
      stats.totalExpense /
      (viewMode === "daily"
        ? 1
        : viewMode === "weekly"
        ? 7
        : viewMode === "monthly"
        ? 30
        : 365)
    ).toFixed(2);

    const highestSpendingDay = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((acc, tx) => {
        const date = tx.date.toDate().toLocaleDateString("it-IT");
        acc[date] = (acc[date] || 0) + tx.amount;
        return acc;
      }, {});

    const highestIncomeDay = transactions
      .filter((tx) => tx.type === "income")
      .reduce((acc, tx) => {
        const date = tx.date.toDate().toLocaleDateString("it-IT");
        acc[date] = (acc[date] || 0) + tx.amount;
        return acc;
      }, {});

    const highestSpendingDayValue = Math.max(
      ...Object.values(highestSpendingDay)
    );
    const highestIncomeDayValue = Math.max(...Object.values(highestIncomeDay));

    const highestSpendingDayDate = Object.keys(highestSpendingDay).find(
      (date) => highestSpendingDay[date] === highestSpendingDayValue
    );
    const highestIncomeDayDate = Object.keys(highestIncomeDay).find(
      (date) => highestIncomeDay[date] === highestIncomeDayValue
    );

    // Statistiche aggiuntive
    doc.text(
      `Entrate totali: ${stats.totalIncome.toFixed(2)} €`,
      14,
      doc.lastAutoTable.finalY + 20
    );
    doc.text(
      `Spese totali: ${stats.totalExpense.toFixed(2)} €`,
      14,
      doc.lastAutoTable.finalY + 30
    );
    doc.text(
      `Saldo: ${stats.balance.toFixed(2)} €`,
      14,
      doc.lastAutoTable.finalY + 40
    );
    doc.text(
      `Media spesa giornaliera: ${averageSpendingPerDay} €`,
      14,
      doc.lastAutoTable.finalY + 50
    );
    doc.text(
      `Numero totale di transazioni: ${totalTransactions}`,
      14,
      doc.lastAutoTable.finalY + 60
    );
    if (highestSpendingDayDate) {
      doc.text(
        `Giorno con spesa più alta: ${highestSpendingDayDate} (${highestSpendingDayValue.toFixed(
          2
        )} €)`,
        14,
        doc.lastAutoTable.finalY + 70
      );
    }
    if (highestIncomeDayDate) {
      doc.text(
        `Giorno con entrata più alta: ${highestIncomeDayDate} (${highestIncomeDayValue.toFixed(
          2
        )} €)`,
        14,
        doc.lastAutoTable.finalY + 80
      );
    }

    // Data e ora creazione PDF
    doc.textWithLink(
      `Report generato il ${today.toLocaleDateString(
        "it-IT"
      )} alle ${today.toLocaleTimeString("it-IT")} su SoldiSotto`,
      14,
      doc.lastAutoTable.finalY + 90,
      {
        url: "https://solomontaiwo.github.io/soldi-sotto/",
      }
    );

    doc.save(fileName);
  };

  const getPeriodText = () => {
    const today = new Date();
    if (viewMode === "daily") {
      return today.toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (viewMode === "weekly") {
      const startOfWeek = today.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const endOfWeek = new Date(
        today.setDate(today.getDate() + 6)
      ).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return `${startOfWeek} - ${endOfWeek}`;
    } else if (viewMode === "monthly") {
      return today.toLocaleDateString("it-IT", {
        month: "long",
        year: "numeric",
      });
    } else if (viewMode === "annually") {
      return today.getFullYear();
    }
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
        <h3>Periodo: {getPeriodText()}</h3>
        <p>
          Visualizza e gestisci le tue statistiche in base al periodo
          selezionato.
        </p>
      </header>
      <div className="stats-controls">
        <button onClick={() => handleViewModeChange("daily")}>
          Giornaliero
        </button>
        <button onClick={() => handleViewModeChange("weekly")}>
          Settimanale
        </button>
        <button onClick={() => handleViewModeChange("monthly")}>Mensile</button>
        <button onClick={() => handleViewModeChange("annually")}>
          Annuale
        </button>
        <button onClick={generatePDF}>Genera PDF</button>
      </div>
      <div className="stat-items">
        <div className="stat-item">
          <h2>Entrate Totali</h2>
          <p>{stats.totalIncome.toFixed(2)} €</p>
        </div>
        <div className="stat-item">
          <h2>Spese Totali</h2>
          <p>{Number(stats.totalExpense).toFixed(2)}
          €</p>
        </div>
        <div className="stat-item">
          <h2>Saldo</h2>
          <p>{stats.balance.toFixed(2)} €</p>
        </div>
      </div>
      <div className="chart-container">
        {stats.totalIncome > 0 || stats.totalExpense > 0 ? (
          <Chart options={options} series={series} type="pie" width="100%" />
        ) : (
          <p>Nessuna transazione disponibile per creare un grafico.</p>
        )}
      </div>
    </div>
  );
};

export default Stats;
