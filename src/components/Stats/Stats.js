import React, { useState, useEffect } from "react";
import { useAuth } from "../Auth/AuthProvider";
import { firestore } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Typography, Row, Col, Card, Button, Divider, Statistic, Radio, Space } from "antd";
import Chart from "react-apexcharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
  differenceInDays,
} from "date-fns";

const { Title, Text } = Typography;

const Stats = () => {
  const { currentUser } = useAuth();
  const [setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    dailyAverageExpense: 0,
    topCategories: [],
  });
  const [viewMode, setViewMode] = useState("monthly");

  useEffect(() => {
    if (currentUser) {
      const fetchTransactions = async () => {
        const today = new Date();
        let startDate, endDate;

        switch (viewMode) {
          case "monthly":
            startDate = startOfMonth(today);
            endDate = endOfMonth(today);
            break;
          case "annually":
            startDate = startOfYear(today);
            endDate = endOfYear(today);
            break;
          case "daily":
          default:
            startDate = startOfDay(today);
            endDate = endOfDay(today);
            break;
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
            amount: parseFloat(doc.data().amount) || 0, // Assicura che amount sia sempre un numero
          }));
          setTransactions(data);
          calculateStats(data, startDate, endDate);
        });

        return () => unsubscribe();
      };

      fetchTransactions();
    }
  }, [currentUser, viewMode]);

  const calculateStats = (transactions, startDate, endDate) => {
    let totalIncome = 0;
    let totalExpense = 0;
    let categories = {};

    transactions.forEach((tx) => {
      if (tx.type === "income") totalIncome += tx.amount;
      if (tx.type === "expense") {
        totalExpense += tx.amount;
        if (tx.category) {
          categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
        }
      }
    });

    const daysCount = differenceInDays(endDate, startDate) + 1; // Calcola i giorni inclusivi
    const dailyAverageExpense = totalExpense / daysCount;

    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }));

    setStats({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      dailyAverageExpense,
      topCategories: sortedCategories,
    });
  };

  const pieChartOptions = {
    chart: { type: "pie" },
    labels: stats.topCategories.map((c) => c.category),
    colors: ["#FF4560", "#00E396", "#008FFB"],
  };
  const pieChartSeries = stats.topCategories.map((c) => c.amount);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Report Statistiche Finanziarie", 14, 16);
    doc.autoTable({
      head: [["Categoria", "Totale"]],
      body: stats.topCategories.map((c) => [c.category, `${c.amount.toFixed(2)} €`]),
    });
    doc.save("report-statistiche.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center" }}>Statistiche Finanziarie</Title>
      <Text type="secondary" style={{ textAlign: "center", display: "block", marginBottom: 20 }}>
        Riepilogo delle tue finanze con una panoramica dettagliata.
      </Text>

      <Space style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
        <Radio.Group
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="daily">Giornaliero</Radio.Button>
          <Radio.Button value="monthly">Mensile</Radio.Button>
          <Radio.Button value="annually">Annuale</Radio.Button>
        </Radio.Group>
      </Space>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Entrate Totali" value={stats.totalIncome.toFixed(2)} suffix="€" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Spese Totali" value={Number(stats.totalExpense).toFixed(2)} suffix="€" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Saldo" value={stats.balance.toFixed(2)} suffix="€" />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card title="Media Giornaliera delle Spese">
            <Statistic value={stats.dailyAverageExpense.toFixed(2)} suffix="€ al giorno" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Categorie Principali di Spesa">
            <ul style={{ padding: 0 }}>
              {stats.topCategories.map((c) => (
                <li key={c.category}>
                  <Text strong>{c.category}:</Text> {Number(c.amount).toFixed(2)} €
                </li>
              ))}
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Distribuzione Entrate/Uscite per Categoria">
            <Chart options={pieChartOptions} series={pieChartSeries} type="pie" width="100%" />
          </Card>
        </Col>
      </Row>

      <Divider />

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Button type="primary" onClick={generatePDF}>
          Scarica Report PDF
        </Button>
      </div>
    </div>
  );
};

export default Stats;
