import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Typography, Row, Col, Card, Button, Statistic, Spin, Select, DatePicker, Divider } from "antd";
import { useAuth } from "../Auth/AuthProvider";
import { firestore } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Navigate } from "react-router-dom";
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
  format,
  differenceInDays,
} from "date-fns";
import { useMediaQuery } from "react-responsive";
import { animationConfig } from "../../utils/animationConfig";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Stats = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { currentUser, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    dailyAverageExpense: 0,
    topCategories: [],
    incomeTrend: [],
    expenseTrend: [],
  });
  const [viewMode, setViewMode] = useState("monthly");
  const [customRange, setCustomRange] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTransactionsAndStats = useCallback(() => {
    setLoading(true);
    const today = new Date();
    let startDate, endDate;

    if (viewMode === "custom" && customRange) {
      [startDate, endDate] = customRange;
    } else {
      switch (viewMode) {
        case "daily":
          startDate = startOfDay(today);
          endDate = endOfDay(today);
          break;
        case "weekly":
          startDate = startOfWeek(today, { weekStartsOn: 1 });
          endDate = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case "annually":
          startDate = startOfYear(today);
          endDate = endOfYear(today);
          break;
        case "monthly":
        default:
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
      }
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
        amount: parseFloat(doc.data().amount) || 0,
      }));
      setTransactions(data);
      calculateStats(data, startDate, endDate);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, viewMode, customRange]);

  useEffect(() => {
    if (!authLoading) {
      if (currentUser) {
        fetchTransactionsAndStats();
      } else {
        setLoading(false);
      }
    }
  }, [currentUser, authLoading, fetchTransactionsAndStats]);

  const calculateStats = (transactions, startDate, endDate) => {
    let totalIncome = 0;
    let totalExpense = 0;
    let categories = {};
    let incomeTrend = [];
    let expenseTrend = [];

    transactions.forEach((tx) => {
      const date = new Date(tx.date.seconds * 1000); // Convert Firebase timestamp
      if (tx.type === "income") {
        totalIncome += tx.amount;
        incomeTrend.push({ x: date, y: tx.amount });
      }
      if (tx.type === "expense") {
        totalExpense += tx.amount;
        expenseTrend.push({ x: date, y: tx.amount });
        if (tx.category) {
          categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
        }
      }
    });

    const daysCount = differenceInDays(endDate, startDate) + 1;
    const dailyAverageExpense = totalExpense / daysCount;

    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    setStats({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      dailyAverageExpense,
      topCategories: sortedCategories,
      incomeTrend,
      expenseTrend,
    });
  };

  const barChartOptions = {
    chart: { type: "bar" },
    xaxis: { categories: stats.topCategories.map((c) => c.category) },
    colors: ["#FF4560"],
  };

  const barChartSeries = [{ name: "Spesa (€)", data: stats.topCategories.map((c) => c.amount) }];

  const lineChartOptions = {
    chart: { type: "line" },
    xaxis: { type: "datetime" },
    colors: ["#00E396", "#FF4560"],
  };

  const lineChartSeries = [
    { name: "Entrate", data: stats.incomeTrend },
    { name: "Uscite", data: stats.expenseTrend },
  ];

  const handleViewModeChange = (value) => {
    setViewMode(value);
    if (value !== "custom") {
      setCustomRange(null);
    }
  };

  const handleRangeChange = (dates) => {
    setCustomRange(dates ? [dates[0].startOf("day").toDate(), dates[1].endOf("day").toDate()] : null);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const logoUrl = `${process.env.PUBLIC_URL}/icon.png`;
    const appUrl = "https://solomontaiwo.github.io/soldi-sotto";
    const instagramUrl = "https://instagram.com/solomon.taiwo";
    const now = new Date();

    const centerX = 105;

    // Logo e link all'applicativo
    doc.addImage(logoUrl, 'PNG', centerX - 15, 10, 30, 30);
    doc.link(centerX - 15, 10, 30, 30, { url: appUrl });

    // Titolo e dettagli
    doc.setFontSize(18);
    doc.text("Report Statistiche Finanziarie", centerX, 50, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Data di generazione: ${format(now, "dd/MM/yyyy HH:mm")}`, centerX, 58, { align: "center" });
    doc.text(`Utente: ${currentUser.email}`, centerX, 64, { align: "center" });

    // Periodo di riferimento
    let periodText = "Mensile";
    if (viewMode === "daily") periodText = "Giorno";
    else if (viewMode === "weekly") periodText = "Mese";
    else if (viewMode === "annually") periodText = "Anno";
    else if (viewMode === "custom" && customRange) {
      periodText = `Dal ${format(customRange[0], "dd/MM/yyyy")} al ${format(customRange[1], "dd/MM/yyyy")}`.toLowerCase();
    } else if (viewMode === "monthly") {
      const startOfMonth = format(new Date(now.getFullYear(), now.getMonth(), 1), "dd/MM/yyyy");
      const endOfMonth = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), "dd/MM/yyyy");
      periodText = `Dal ${startOfMonth} al ${endOfMonth}`.toLowerCase();
    }
    doc.text(`Periodo di riferimento: ${periodText}`, centerX, 70, { align: "center" });

    // Calcola il numero di giorni nel periodo selezionato
    let startDate, endDate;
    if (viewMode === "custom" && customRange) {
      [startDate, endDate] = customRange;
    } else {
      const today = new Date();
      switch (viewMode) {
        case "daily":
          startDate = startOfDay(today);
          endDate = endOfDay(today);
          break;
        case "weekly":
          startDate = startOfWeek(today, { weekStartsOn: 1 });
          endDate = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case "annually":
          startDate = startOfYear(today);
          endDate = endOfYear(today);
          break;
        case "monthly":
        default:
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
      }
    }
    const daysCount = differenceInDays(endDate, startDate) + 1;

    // Calcola statistiche extra
    const totalIncomeTransactions = transactions.filter((tx) => tx.type === "income").length;
    const totalExpenseTransactions = transactions.filter((tx) => tx.type === "expense").length;
    // eslint-disable-next-line
    const totalTransactions = totalIncomeTransactions + totalExpenseTransactions;
    const avgDailyIncome = stats.totalIncome / daysCount;
    const avgDailyExpense = stats.totalExpense / daysCount;

    // Tabella delle spese totali, entrate totali, saldo e media giornaliera
    doc.autoTable({
      startY: 85,
      head: [["Entrate Totali", "Spese Totali", "Saldo", "Media Giornaliera Entrate", "Media Giornaliera Uscite"]],
      body: [[
        `${stats.totalIncome.toFixed(2)} €`,
        `${stats.totalExpense.toFixed(2)} €`,
        `${stats.balance.toFixed(2)} €`,
        `${avgDailyIncome.toFixed(2)} €`,
        `${avgDailyExpense.toFixed(2)} €`
      ]],
      margin: { bottom: 20 }
    });

    // Distribuzione delle spese per categoria
    doc.text("Distribuzione delle Spese per Categoria (%)", 14, doc.lastAutoTable.finalY + 10);
    const totalExpense = stats.totalExpense;
    const categoryDistribution = stats.topCategories.map((c) => [
      `${c.category.charAt(0).toUpperCase() + c.category.slice(1)}`,
      `${((c.amount / totalExpense) * 100).toFixed(2)}%`
    ]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Categoria", "Percentuale"]],
      body: categoryDistribution,
      margin: { bottom: 20 }
    });

    // Transazione media per categoria
    doc.text("Transazione Media per Categoria", 14, doc.lastAutoTable.finalY + 10);
    const averageTransactionPerCategory = stats.topCategories.map((c) => [
      `${c.category.charAt(0).toUpperCase() + c.category.slice(1)}`,
      `${(c.amount / transactions.filter((tx) => tx.category === c.category).length).toFixed(2)} €`
    ]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Categoria", "Importo Medio"]],
      body: averageTransactionPerCategory,
      margin: { bottom: 20 }
    });

    // Top 3 spese maggiori e minori
    const sortedExpenses = transactions
      .filter((tx) => tx.type === "expense")
      .sort((a, b) => b.amount - a.amount);
    const topExpenses = sortedExpenses.slice(0, 3);
    const lowestExpenses = sortedExpenses.slice(-3);

    doc.text("Top 3 Spese Maggiori", 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Data", "Descrizione", "Importo", "Categoria"]],
      body: topExpenses.map((tx) => [
        format(new Date(tx.date.seconds * 1000), "dd/MM/yyyy"),
        tx.description,
        `${tx.amount.toFixed(2)} €`,
        tx.category.charAt(0).toUpperCase() + tx.category.slice(1)
      ]),
      margin: { bottom: 20 }
    });

    doc.text("Top 3 Spese Minori", 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Data", "Descrizione", "Importo", "Categoria"]],
      body: lowestExpenses.map((tx) => [
        format(new Date(tx.date.seconds * 1000), "dd/MM/yyyy"),
        tx.description,
        `${tx.amount.toFixed(2)} €`,
        tx.category.charAt(0).toUpperCase() + tx.category.slice(1)
      ]),
      margin: { bottom: 20 }
    });

    // Piè di pagina
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.text("Generato da Soldi Sotto, app made with love by Solomon", 200, pageHeight - 20, { align: "right" });
      doc.textWithLink(appUrl, 200, pageHeight - 15, { align: "right", url: appUrl });
      doc.textWithLink("Instagram: @solomon.taiwo", 200, pageHeight - 10, { align: "right", url: instagramUrl });
    }

    // Salva il file PDF
    const filename = `report-statistiche-${periodText.replace(/\s+/g, '-')}.pdf`.toLowerCase();
    doc.save(filename);
  };


  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip="Caricamento..." />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", color: "var(--text-color)" }}>
      <motion.div {...animationConfig} style={{ textAlign: "center", marginBottom: "10px" }}>
        <Title level={2} style={{ color: "var(--primary-color)", textAlign: "center" }}>Statistiche</Title>
        <Text style={{ color: "var(--text-color)", textAlign: "center", display: "block", marginBottom: 20 }}>
          Riepilogo delle tue transazioni e statistiche finanziarie, per tenere traccia del tuo bilancio.
        </Text>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Button type="primary" onClick={generatePDF} style={{
            width: isMobile ? "100%" : "50%",
            height: isMobile ? "50px" : "60px",
            fontSize: isMobile ? "16px" : "18px",
            display: "block",
            margin: "0 auto",
            marginBottom: 20,
            backgroundColor: "var(--button-bg-color)",
            borderColor: "var(--button-bg-color)",
          }}>
            Scarica Report PDF
          </Button>
          <Select
            value={viewMode}
            onChange={handleViewModeChange}
            style={{ width: isMobile ? "100%" : "50%", textAlign: "center", color: "var(--text-color)" }}
          >
            <Option value="daily">Oggi</Option>
            <Option value="weekly">Settimana corrente</Option>
            <Option value="monthly">Mese corrente</Option>
            <Option value="annually">Anno corrente</Option>
            <Option value="custom">Personalizzato</Option>
          </Select>
          {viewMode === "custom" && <RangePicker onChange={handleRangeChange} />}
        </div>
      </motion.div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <Spin size="large" tip="Caricamento in corso..." />
        </div>
      ) : (
        <>
          <motion.div {...animationConfig} style={{ textAlign: "center", marginBottom: "10px" }}>
            <Row gutter={16}>
              <Col xs={24} md={8}>

                <Card style={{ backgroundColor: "var(--card-background)", color: "var(--text-color)" }}>
                  <Statistic title={<span className="statistic-title">Entrate Totali</span>} value={stats.totalIncome.toFixed(2)} suffix="€" valueStyle={{ color: "var(--text-color)" }} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card style={{ backgroundColor: "var(--card-background)", color: "var(--text-color)" }}>
                  <Statistic title={<span className="statistic-title">Spese Totali</span>} value={stats.totalExpense.toFixed(2)} suffix="€" valueStyle={{ color: "var(--text-color)" }} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card style={{ backgroundColor: "var(--card-background)", color: "var(--text-color)" }}>
                  <Statistic title={<span className="statistic-title">Saldo</span>} value={stats.balance.toFixed(2)} suffix="€" valueStyle={{ color: "var(--text-color)" }} />
                </Card>
              </Col>
            </Row>

            <Divider style={{ borderColor: "var(--text-color)" }} />

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Card title={<span style={{ color: "var(--text-color)" }}>Categorie Principali di Spesa</span>} style={{ backgroundColor: "var(--card-background)" }}>
                  <Chart options={barChartOptions} series={barChartSeries} type="bar" width="100%" />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title={<span style={{ color: "var(--text-color)" }}>Tendenze Entrate e Uscite nel Tempo</span>} style={{ backgroundColor: "var(--card-background)" }}>
                  <Chart options={lineChartOptions} series={lineChartSeries} type="line" width="100%" />
                </Card>

              </Col>
            </Row>
          </motion.div>
        </>
      )}
    </div >
  );
};

export default Stats;
