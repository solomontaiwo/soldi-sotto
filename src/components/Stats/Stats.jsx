import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Typography,
  Row,
  Col,
  Button,
  Statistic,
  Select,
  DatePicker,
  Divider,
  Empty,
  Card,
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
  differenceInDays,
} from "date-fns";
import { calculateStats } from "../../utils/statsUtils";
import { generatePDF } from "../../utils/pdfUtils";
import { animationConfig } from "../../utils/animationConfig";
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
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState("monthly");
  const [customRange, setCustomRange] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const loading = authLoading || transactionsLoading;
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { theme } = useTheme();

  useEffect(() => {
    if (!loading && transactions.length > 0) {
      const today = new Date();
      let start, end;

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

      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = transaction.date.toDate();
        return (
          isAfter(transactionDate, start) && isBefore(transactionDate, end)
        );
      });

      setStats(calculateStats(filteredTransactions, start, end));
      setStartDate(start);
      setEndDate(end);
    }
  }, [loading, transactions, viewMode, customRange]);

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

  // Definizione colori della card basati sul tema attivo
  const cardBackgroundColor = "var(--card-background)";
  const cardTextColor = "var(--text-color)";

  // Calcolo della media giornaliera per entrate e spese
  const daysCount =
    startDate && endDate
      ? differenceInDays(endOfDay(endDate), startOfDay(startDate)) + 1
      : 0;
  const avgDailyIncome = stats
    ? daysCount > 0
      ? stats.totalIncome / daysCount
      : 0
    : 0;
  const avgDailyExpense = stats
    ? daysCount > 0
      ? stats.totalExpense / daysCount
      : 0
    : 0;

  // Calcolo del risparmio come percentuale delle entrate
  const savingPercentage =
    stats && stats.totalIncome > 0
      ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100
      : 0;

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
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
              }}
            >
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
        {stats && stats.totalIncome !== undefined ? (
          <>
            <Row
              gutter={16}
              justify="center"
              style={{ marginBottom: "20px", marginTop: "30px" }}
            >
              <Col xs={24} md={8}>
                <motion.div {...animationConfig}>
                  <Card
                    style={{
                      textAlign: "center",
                      borderRadius: "8px",
                      backgroundColor: cardBackgroundColor,
                      color: cardTextColor,
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                      marginBottom: isMobile ? "10px" : "0",
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "var(--text-color)" }}>
                          Entrate Totali
                        </span>
                      }
                      value={formatCurrency(stats.totalIncome || 0)}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} md={8}>
                <motion.div {...animationConfig}>
                  <Card
                    style={{
                      textAlign: "center",
                      borderRadius: "8px",
                      backgroundColor: cardBackgroundColor,
                      color: cardTextColor,
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                      marginBottom: isMobile ? "10px" : "0",
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "var(--text-color)" }}>
                          Spese Totali
                        </span>
                      }
                      value={formatCurrency(stats.totalExpense || 0)}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} md={8}>
                <motion.div {...animationConfig}>
                  <Card
                    style={{
                      textAlign: "center",
                      borderRadius: "8px",
                      backgroundColor: cardBackgroundColor,
                      color: cardTextColor,
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                      marginBottom: isMobile ? "10px" : "0",
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "var(--text-color)" }}>
                          Saldo
                        </span>
                      }
                      value={formatCurrency(stats.balance || 0)}
                      valueStyle={{
                        color: theme === "dark" ? "#e0e0e0" : "#333333",
                      }}
                    />
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* Nuove metriche in stile card */}
            <motion.div {...animationConfig}>
              <Divider>Metriche Aggiuntive</Divider>
            </motion.div>

            <Row
              gutter={16}
              justify="center"
              style={{ marginBottom: "20px", marginTop: "20px" }}
            >
              <Col xs={24} md={8}>
                <motion.div {...animationConfig}>
                  <Card
                    style={{
                      textAlign: "center",
                      borderRadius: "8px",
                      backgroundColor: cardBackgroundColor,
                      color: cardTextColor,
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                      marginBottom: isMobile ? "10px" : "0",
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "var(--text-color)" }}>
                          Media Giornaliera Entrate
                        </span>
                      }
                      value={formatCurrency(avgDailyIncome)}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} md={8}>
                <motion.div {...animationConfig}>
                  <Card
                    style={{
                      textAlign: "center",
                      borderRadius: "8px",
                      backgroundColor: cardBackgroundColor,
                      color: cardTextColor,
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                      marginBottom: isMobile ? "10px" : "0",
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "var(--text-color)" }}>
                          Media Giornaliera Spese
                        </span>
                      }
                      value={formatCurrency(avgDailyExpense)}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} md={8}>
                <motion.div {...animationConfig}>
                  <Card
                    style={{
                      textAlign: "center",
                      borderRadius: "8px",
                      backgroundColor: cardBackgroundColor,
                      color: cardTextColor,
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                      marginBottom: isMobile ? "10px" : "0",
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: "var(--text-color)" }}>
                          Percentuale di Risparmio
                        </span>
                      }
                      value={`${savingPercentage.toFixed(2)}%`}
                      valueStyle={{
                        color: theme === "dark" ? "#e0e0e0" : "#333333",
                      }}
                    />
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </>
        ) : (
          <motion.div
            {...animationConfig}
            style={{ textAlign: "center", marginTop: "20px" }}
          >
            <Empty description="Nessuna statistica disponibile per il periodo selezionato." />
          </motion.div>
        )}
      </div>
    </LoadingWrapper>
  );
};

export default Stats;
