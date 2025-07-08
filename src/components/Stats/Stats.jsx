import { useState, useEffect, useMemo } from "react";
import React from "react";
import { motion } from "framer-motion";
import { Card, Row, Col, Button, Form } from "react-bootstrap";
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
  isEqual,
} from "date-fns";
import { calculateStats } from "../../utils/statsUtils";
import { generatePDF } from "../../utils/pdfUtils";
import { animationConfig } from "../../utils/animationConfig";
import { useMediaQuery } from "react-responsive";
import LoadingWrapper from "../../utils/loadingWrapper";
import formatCurrency from "../../utils/formatCurrency";
import logo from "/icon.png";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Stats component: shows detailed statistics for the selected period
// Uses useMemo for all heavy calculations for performance
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
          (isAfter(transactionDate, start) ||
            isEqual(transactionDate, start)) &&
          (isBefore(transactionDate, end) || isEqual(transactionDate, end))
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

  // Memoized calculation of days count, average daily income/expense, and saving percentage
  const daysCount = useMemo(() => (
    startDate && endDate
      ? differenceInDays(endOfDay(endDate), startOfDay(startDate)) + 1
      : 0
  ), [startDate, endDate]);
  const avgDailyIncome = useMemo(() => {
    if (!stats || daysCount === 0) return 0;
    return stats.totalIncome / daysCount;
  }, [stats, daysCount]);
  const avgDailyExpense = useMemo(() => {
    if (!stats || daysCount === 0) return 0;
    return stats.totalExpense / daysCount;
  }, [stats, daysCount]);
  const savingPercentage = useMemo(() => {
    if (!stats || stats.totalIncome === 0) return 0;
    return ((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100;
  }, [stats]);

  if (!currentUser) return <Navigate to="/login" replace />;

  if (loading) {
    // Skeleton ultra-minimal per box statistiche e grafici
    return (
      <div className="container py-4">
        <div className="row g-4 mb-4">
          {[...Array(3)].map((_, i) => (
            <div className="col-12 col-md-4" key={i}>
              <Skeleton height={90} borderRadius={18} />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <Skeleton height={260} borderRadius={24} />
        </div>
        <div className="row g-4">
          {[...Array(2)].map((_, i) => (
            <div className="col-12 col-md-6" key={i}>
              <Skeleton height={180} borderRadius={18} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <LoadingWrapper loading={loading}>
      <div
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          color: "var(--text-color)"
        }}
      >
        <motion.div
          {...animationConfig}
          style={{ textAlign: "center", marginBottom: "30px" }}
        >
          <h2 className="text-primary fw-bold mb-3" style={{ fontSize: '2.5rem' }}>
            Statistiche
          </h2>
          <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
            Riepilogo delle tue transazioni e statistiche finanziarie, per
            tenere traccia del tuo bilancio.
          </p>
          
          {/* PDF Export Button */}
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
            variant="primary"
            className="mb-4"
            style={{
              width: "100%",
              height: isMobile ? "50px" : "60px",
              fontSize: isMobile ? "16px" : "18px",
              borderRadius: "12px",
              fontWeight: "600"
            }}
          >
            📄 Scarica Report PDF
          </Button>
          
          {/* View Mode Selector */}
          <Form.Select
            value={viewMode}
            onChange={(e) => handleViewModeChange(e.target.value)}
            className="mb-4"
            style={{
              height: "50px",
              borderRadius: "12px",
              fontSize: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.9)"
            }}
          >
            <option value="daily">Oggi</option>
            <option value="weekly">Settimana corrente</option>
            <option value="monthly">Mese corrente</option>
            <option value="annually">Anno corrente</option>
          </Form.Select>
        </motion.div>

        {stats ? (
          <motion.div {...animationConfig}>
            {/* Main Statistics Cards */}
            <Row className="g-4 mb-5">
              <Col xs={12} md={6} lg={3}>
                <Card 
                  className="mb-4 shadow-sm glass-card stats-glass"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,245,255,0.82) 100%)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                    borderRadius: "22px",
                    transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.025)';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.13)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
                  }}
                >
                  <Card.Body className="text-center p-4">
                    <div className="mb-3" style={{ fontSize: '2.5rem' }}>💰</div>
                    <h6 className="text-muted mb-2">Entrate Totali</h6>
                    <h4 className="text-success fw-bold mb-0">{formatCurrency(stats.totalIncome)}</h4>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} md={6} lg={3}>
                <Card 
                  className="mb-4 shadow-sm glass-card stats-glass"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,245,255,0.82) 100%)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                    borderRadius: "22px",
                    transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.025)';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.13)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
                  }}
                >
                  <Card.Body className="text-center p-4">
                    <div className="mb-3" style={{ fontSize: '2.5rem' }}>💸</div>
                    <h6 className="text-muted mb-2">Uscite Totali</h6>
                    <h4 className="text-danger fw-bold mb-0">{formatCurrency(stats.totalExpense)}</h4>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} md={6} lg={3}>
                <Card 
                  className="mb-4 shadow-sm glass-card stats-glass"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,245,255,0.82) 100%)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                    borderRadius: "22px",
                    transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.025)';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.13)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
                  }}
                >
                  <Card.Body className="text-center p-4">
                    <div className="mb-3" style={{ fontSize: '2.5rem' }}>📊</div>
                    <h6 className="text-muted mb-2">Bilancio</h6>
                    <h4 className={`fw-bold mb-0 ${stats.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(stats.balance)}
                    </h4>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} md={6} lg={3}>
                <Card 
                  className="mb-4 shadow-sm glass-card stats-glass"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,245,255,0.82) 100%)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                    borderRadius: "22px",
                    transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.025)';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.13)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
                  }}
                >
                  <Card.Body className="text-center p-4">
                    <div className="mb-3" style={{ fontSize: '2.5rem' }}>📈</div>
                    <h6 className="text-muted mb-2">Transazioni</h6>
                    <h4 className="text-primary fw-bold mb-0">{stats.transactionCount}</h4>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Secondary Statistics */}
            <Row className="g-4 mb-5">
              <Col xs={12} md={6}>
                <Card 
                  className="mb-4 shadow-sm glass-card stats-glass"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,245,255,0.82) 100%)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                    borderRadius: "22px",
                    transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.025)';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.13)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
                  }}
                >
                  <Card.Body className="p-4">
                    <h5 className="text-dark fw-semibold mb-3">📅 Medie Giornaliere</h5>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Entrata media:</span>
                      <span className="text-success fw-medium">{formatCurrency(avgDailyIncome)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Spesa media:</span>
                      <span className="text-danger fw-medium">{formatCurrency(avgDailyExpense)}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} md={6}>
                <Card 
                  className="mb-4 shadow-sm glass-card stats-glass"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,245,255,0.82) 100%)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                    borderRadius: "22px",
                    transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.025)';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.13)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
                  }}
                >
                  <Card.Body className="p-4">
                    <h5 className="text-dark fw-semibold mb-3">💎 Tasso di Risparmio</h5>
                    <div className="text-center">
                      <div 
                        className={`display-6 fw-bold ${savingPercentage >= 0 ? 'text-success' : 'text-danger'}`}
                      >
                        {savingPercentage.toFixed(1)}%
                      </div>
                      <small className="text-muted">
                        {savingPercentage >= 0 ? 'Stai risparmiando!' : 'Stai spendendo più di quanto guadagni'}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Category Breakdown */}
            {stats.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 && (
              <Card 
                className="mb-4 shadow-sm glass-card stats-glass"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,245,255,0.82) 100%)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1.5px solid rgba(255,255,255,0.35)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                  borderRadius: "22px",
                  transition: "transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.025)';
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.13)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
                }}
              >
                <Card.Body className="p-4">
                  <h5 className="text-dark fw-semibold mb-4">📋 Spese per Categoria</h5>
                  <Row className="g-3">
                    {Object.entries(stats.categoryBreakdown).map(([category, amount]) => (
                      <Col key={category} xs={12} sm={6} md={4}>
                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                          <span className="text-capitalize fw-medium">{category}</span>
                          <span className="text-danger fw-bold">{formatCurrency(amount)}</span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div {...animationConfig}>
            <Card className="border-0 shadow-sm text-center glass-card" style={{ borderRadius: '1rem', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Card.Body className="p-5">
                <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>📊</div>
                <h4 className="text-muted mb-3">Nessuna transazione trovata</h4>
                <p className="text-muted mb-4">
                  Non ci sono transazioni per il periodo selezionato. Prova a cambiare il periodo di visualizzazione o aggiungi delle transazioni.
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => window.location.href = "/transactions"}
                  style={{ borderRadius: '12px', padding: '12px 24px' }}
                >
                  Aggiungi Transazioni
                </Button>
              </Card.Body>
            </Card>
          </motion.div>
        )}
      </div>
    </LoadingWrapper>
  );
};

export default React.memo(Stats);
