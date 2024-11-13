import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Statistic,
  Select,
  DatePicker,
  Divider,
} from "antd";
import { useAuth } from "../Auth/AuthProvider";
import { useTransactions } from "../Transaction/TransactionProvider";
import { Navigate } from "react-router-dom";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
  isAfter,
  isBefore,
} from "date-fns";
import { calculateStats } from "../../utils/statsUtils";
import { generatePDF } from "../../utils/pdfUtils";
import { animationConfig } from "../../utils/animationConfig";
import StatsCharts from "./StatsCharts";
import { useMediaQuery } from "react-responsive";
import LoadingWrapper from "../../utils/loadingWrapper";
import formatCurrency from "../../utils/formatCurrency";
import { useTheme } from "../../utils/ThemeProvider";
import logo from "/icon.png";

const { Title, Text } = Typography;
const { Option } = Select;

const Stats = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactions();
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const loading = authLoading || transactionsLoading;
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { theme } = useTheme();

  // Definisci le serie dei dati per i grafici
  const barChartSeries = [
    {
      name: "Spesa (€)",
      data: (stats.topCategories || []).map((c) => c.amount),
    },
  ];

  const lineChartSeries = [
    { name: "Entrate", data: stats.incomeTrend || [] },
    { name: "Uscite", data: stats.expenseTrend || [] },
  ];

  useEffect(() => {
    if (transactions.length > 0) {
      const today = new Date();
      let start, end;

      // Determina il range di date in base al periodo selezionato
      if (viewMode === "custom" && customRange) {
        [start, end] = customRange;
      } else {
        switch (viewMode) {
          case "daily":
            start = startOfDay(today);
            end = endOfDay(today);
            break;
          case "weekly":
            start = startOfWeek(today, { weekStartsOn: 1 });
            end = endOfWeek(today, { weekStartsOn: 1 });
            break;
          case "annually":
            start = startOfYear(today);
            end = endOfYear(today);
            break;
          case "monthly":
          default:
            start = startOfMonth(today);
            end = endOfMonth(today);
            break;
        }
      }

      // Filtra le transazioni in base al periodo selezionato usando start e end
      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = transaction.date.toDate();
        return (
          isAfter(transactionDate, start) && isBefore(transactionDate, end)
        );
      });

      // Calcola le statistiche in base alle transazioni filtrate
      setStats(calculateStats(filteredTransactions, start, end));

      // Aggiorna startDate ed endDate per altre funzionalità (es. per il PDF)
      setStartDate(start);
      setEndDate(end);
    }
  }, [transactions, viewMode, customRange]);

  const handleViewModeChange = (value) => {
    setViewMode(value);
    if (value !== "custom") setCustomRange(null);
  };

  const handleRangeChange = (dates) => {
    setCustomRange(
      dates
        ? [dates[0].startOf("day").toDate(), dates[1].endOf("day").toDate()]
        : null
    );
  };

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <LoadingWrapper loading={loading}>
      <div
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          color: "var(--text-color)",
        }}
      >
        <motion.div
          {...animationConfig}
          style={{ textAlign: "center", marginBottom: "10px" }}
        >
          <Title
            level={2}
            style={{ color: "var(--primary-color)", textAlign: "center" }}
          >
            Statistiche
          </Title>
          <Text
            style={{
              color: "var(--text-color)",
              textAlign: "center",
              display: "block",
              marginBottom: 20,
            }}
          >
            Riepilogo delle tue transazioni e statistiche finanziarie, per
            tenere traccia del tuo bilancio.
          </Text>
          <Button
            onClick={() =>
              generatePDF(
                currentUser,
                transactions,
                stats,
                viewMode,
                logo,
                "https://solomontaiwo.github.io/soldi-sotto/",
                "https://www.instagram.com/solomon.taiwo/",
                startDate,
                endDate
              )
            }
            type="primary"
            style={{
              width: "100%",
              height: isMobile ? "50px" : "60px",
              fontSize: isMobile ? "16px" : "18px",
              display: "block",
              margin: "0 auto",
              marginBottom: 20,
              backgroundColor: "var(--button-bg-color)",
              borderColor: "var(--button-bg-color)",
            }}
          >
            Scarica Report PDF
          </Button>
          <Select
            value={viewMode}
            onChange={handleViewModeChange}
            style={{ width: "100%" }}
          >
            <Option value="daily">Oggi</Option>
            <Option value="weekly">Settimana corrente</Option>
            <Option value="monthly">Mese corrente</Option>
            <Option value="annually">Anno corrente</Option>
            <Option value="custom">Personalizzato</Option>
          </Select>
          {viewMode === "custom" && (
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <DatePicker
                onChange={(date) =>
                  setCustomRange([date, customRange ? customRange[1] : null])
                }
                placeholder="Data Inizio"
                style={{ width: "100%" }}
              />
              <DatePicker
                onChange={(date) =>
                  setCustomRange([customRange ? customRange[0] : null, date])
                }
                placeholder="Data Fine"
                style={{ width: "100%" }}
              />
            </div>
          )}
        </motion.div>

        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Entrate Totali"
              value={formatCurrency(stats.totalIncome)}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Spese Totali"
              value={formatCurrency(stats.totalExpense)}
            />
          </Col>
          <Col span={8}>
            <Statistic title="Saldo" value={formatCurrency(stats.balance)} />
          </Col>
        </Row>
        <Divider />
        <StatsCharts
          barChartSeries={barChartSeries}
          lineChartSeries={lineChartSeries}
          categories={stats.topCategories.map((c) => c.category)}
          theme={theme}
        />
      </div>
    </LoadingWrapper>
  );
};

export default Stats;
