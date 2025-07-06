import { Card, Row, Col, Alert, Form, ProgressBar } from "react-bootstrap";
import { FiBarChart, FiTrendingUp, FiTrendingDown, FiPieChart, FiCalendar, FiDollarSign, FiArrowUp, FiArrowDown, FiTarget, FiActivity } from "react-icons/fi";
// Analytics component - Auth provider not needed for this component
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import formatCurrency from "../../utils/formatCurrency";
import { useCategories } from "../../utils/categories";
import React from "react";

// TransactionAnalytics component: shows financial analytics and insights
// Uses useMemo for periods and mainStats for performance
const TransactionAnalytics = () => {
  const { isDemo, transactions, maxTransactions } = useUnifiedTransactions();
  const { expenseCategories, incomeCategories } = useCategories();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [stats, setStats] = useState({});

  // Memoized list of main statistics to display
  const mainStats = useMemo(() => [
    {
      title: "Entrate Totali",
      value: stats.totalIncome || 0,
      icon: <FiTrendingUp size={24} />,
      color: "var(--accent-success)",
      bgColor: "var(--pastel-mint)",
      formatter: formatCurrency
    },
    {
      title: "Uscite Totali",
      value: stats.totalExpense || 0,
      icon: <FiTrendingDown size={24} />,
      color: "var(--accent-error)",
      bgColor: "var(--pastel-coral)",
      formatter: formatCurrency
    },
    {
      title: "Bilancio",
      value: stats.balance || 0,
      icon: <FiDollarSign size={24} />,
      color: stats.balance >= 0 ? "var(--accent-success)" : "var(--accent-error)",
      bgColor: stats.balance >= 0 ? "var(--pastel-mint)" : "var(--pastel-coral)",
      formatter: formatCurrency
    },
    {
      title: "Tasso Risparmio",
      value: stats.savingsRate || 0,
      icon: <FiTarget size={24} />,
      color: stats.savingsRate >= 20 ? "var(--accent-success)" : stats.savingsRate >= 10 ? "var(--accent-warning)" : "var(--accent-error)",
      bgColor: stats.savingsRate >= 20 ? "var(--pastel-mint)" : stats.savingsRate >= 10 ? "var(--pastel-cream)" : "var(--pastel-coral)",
      formatter: (value) => `${value.toFixed(1)}%`
    }
  ], [stats]);

  // Calcola statistiche avanzate
  const calculateAdvancedStats = useMemo(() => {
    if (!transactions.length) return {};

    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case "thisMonth":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "lastMonth": {
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      }
      case "thisYear":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case "last3Months":
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case "custom":
        startDate = new Date(customRange.from);
        endDate = new Date(customRange.to);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = transaction.date.toDate ? transaction.date.toDate() : new Date(transaction.date);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate });
    });

    const totalIncome = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // Analisi per categoria
    const expenseByCategory = {};
    const incomeByCategory = {};

    filteredTransactions.forEach(t => {
      if (t.type === "expense") {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      } else {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      }
    });

    // Top categorie spesa
    const topExpenseCategories = Object.entries(expenseByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => {
        const categoryData = expenseCategories.find(c => c.value === category);
        return {
          category,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
          label: categoryData ? categoryData.label : category,
          emoji: categoryData ? categoryData.label.split(" ")[0] : "💸"
        };
      });

    // Top categorie entrata
    const topIncomeCategories = Object.entries(incomeByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => {
        const categoryData = incomeCategories.find(c => c.value === category);
        return {
          category,
          amount,
          percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
          label: categoryData ? categoryData.label : category,
          emoji: categoryData ? categoryData.label.split(" ")[0] : "💰"
        };
      });

    // Trend mensile (ultimi 6 mesi)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = t.date.toDate ? t.date.toDate() : new Date(t.date);
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpense = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyTrend.push({
        month: format(monthStart, "MMM yyyy", { locale: it }),
        income: monthIncome,
        expense: monthExpense,
        balance: monthIncome - monthExpense
      });
    }

    // Statistiche di risparmio
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const avgDailyExpense = totalExpense / Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
    const avgTransactionAmount = filteredTransactions.length > 0 ? 
      filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      avgDailyExpense,
      avgTransactionAmount,
      topExpenseCategories,
      topIncomeCategories,
      monthlyTrend,
      transactionCount: filteredTransactions.length,
      periodLabel: selectedPeriod,
      startDate,
      endDate
    };
  }, [transactions, selectedPeriod, expenseCategories, incomeCategories, customRange]);

  useEffect(() => {
    setStats(calculateAdvancedStats);
  }, [calculateAdvancedStats]);

  return (
    <div style={{ 
      padding: isMobile ? '1rem' : '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      color: 'var(--text-primary)'
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <div>
            <h2 className="text-dark fw-bold mb-2 d-flex align-items-center gap-2">
              <FiBarChart size={28} />
              Analytics & Insights
        </h2>
            <p className="text-muted mb-0">
              Analizza le tue abitudini finanziarie e scopri pattern nascosti
            </p>
          </div>
          
          <div className="d-flex gap-2">
            <Form.Select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              style={{ maxWidth: 200, display: "inline-block" }}
            >
              <option value="month">Questo Mese</option>
              <option value="lastMonth">Mese Scorso</option>
              <option value="last3Months">Ultimi 3 Mesi</option>
              <option value="year">Quest&apos;Anno</option>
              <option value="custom">Personalizzato...</option>
            </Form.Select>
            {selectedPeriod === "custom" && (
              <div className="d-inline-flex align-items-center gap-2 ms-3">
                <Form.Label className="mb-0 small">Dal</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={customRange.from}
                  onChange={e => setCustomRange(r => ({ ...r, from: e.target.value }))}
                  style={{ minWidth: 120 }}
                />
                <Form.Label className="mb-0 small">al</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={customRange.to}
                  onChange={e => setCustomRange(r => ({ ...r, to: e.target.value }))}
                  style={{ minWidth: 120 }}
                />
              </div>
            )}
          </div>
        </div>

      {/* Demo Alert */}
      {isDemo && (
                  <Alert variant="info" className="border-0 mb-4" style={{ 
          borderRadius: '2rem',
            backgroundColor: 'rgba(13, 202, 240, 0.1)',
            border: '1px solid rgba(13, 202, 240, 0.2)',
          }}>
            <Alert.Heading className="h6 fw-bold text-info">
              🎯 Modalità Demo Attiva
            </Alert.Heading>
            <p className="mb-0">
              Visualizzi analytics demo con {transactions.length}/{maxTransactions} transazioni. 
              Registrati per analytics complete e storiche!
            </p>
          </Alert>
        )}
        </motion.div>

      {/* Main Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-5"
          >
        <Row className="g-4">
          {mainStats.map((stat, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
            <Card 
                className="mb-4 shadow-sm glass-card analytics-glass"
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
              <Card.Body className="p-4 text-center">
                <div 
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                      backgroundColor: stat.color + '20',
                      color: stat.color,
                  }}
                >
                    {stat.icon}
                </div>
                  <h5 className="fw-bold text-dark mb-1">{stat.formatter(stat.value)}</h5>
                  <p className="text-muted small mb-0">{stat.title}</p>
              </Card.Body>
            </Card>
            </Col>
          ))}
        </Row>
          </motion.div>

      {/* Top Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-5"
          >
        <Row className="g-4">
          {/* Top Expense Categories */}
          <Col xs={12} lg={6}>
            <Card 
              className="h-100 border-0 shadow-sm glass-card"
              style={{
                borderRadius: '2rem',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Card.Body className="p-4">
                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                  <FiTrendingDown className="text-danger" size={20} />
                  Top Categorie Spesa
                </h5>
                
                {stats.topExpenseCategories?.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {stats.topExpenseCategories.map((cat, index) => (
                      <div key={index} className="d-flex align-items-center gap-3">
                        <div className="text-center" style={{ minWidth: '40px' }}>
                          <div style={{ fontSize: '24px' }}>{cat.emoji}</div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-medium text-dark">{cat.label}</span>
                            <span className="text-danger fw-bold">{formatCurrency(cat.amount)}</span>
                          </div>
                          <ProgressBar
                            now={cat.percentage}
                            style={{ height: '6px', borderRadius: '3px' }}
                            className="mb-1"
                          />
                          <small className="text-muted">{cat.percentage.toFixed(1)}% del totale</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <FiPieChart size={48} className="mb-3 opacity-50" />
                    <p>Nessuna spesa nel periodo selezionato</p>
                </div>
                )}
              </Card.Body>
            </Card>
        </Col>

          {/* Top Income Categories */}
          <Col xs={12} lg={6}>
            <Card 
              className="h-100 border-0 shadow-sm glass-card"
              style={{
                borderRadius: '2rem',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Card.Body className="p-4">
                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                  <FiTrendingUp className="text-success" size={20} />
                  Top Categorie Entrata
                </h5>
                
                {stats.topIncomeCategories?.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {stats.topIncomeCategories.map((cat, index) => (
                      <div key={index} className="d-flex align-items-center gap-3">
                        <div className="text-center" style={{ minWidth: '40px' }}>
                          <div style={{ fontSize: '24px' }}>{cat.emoji}</div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-medium text-dark">{cat.label}</span>
                            <span className="text-success fw-bold">{formatCurrency(cat.amount)}</span>
                          </div>
                          <ProgressBar
                            now={cat.percentage}
                            variant="success"
                            style={{ height: '6px', borderRadius: '3px' }}
                            className="mb-1"
                          />
                          <small className="text-muted">{cat.percentage.toFixed(1)}% del totale</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <FiPieChart size={48} className="mb-3 opacity-50" />
                    <p>Nessuna entrata nel periodo selezionato</p>
                </div>
                )}
              </Card.Body>
            </Card>
        </Col>
      </Row>
      </motion.div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-5"
      >
        <Card 
          className="border-0 shadow-sm glass-card"
          style={{
            borderRadius: '2rem',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <Card.Body className="p-4">
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
              <FiActivity className="text-primary" size={20} />
              Trend Ultimi 6 Mesi
            </h5>
            
            {stats.monthlyTrend?.length > 0 ? (
              <div className="row g-2">
                {stats.monthlyTrend.map((month, index) => (
                  <div key={index} className="col-6 col-md-4 col-lg-2">
                    <div 
                      className="text-center p-3 rounded-3"
                      style={{
                        backgroundColor: month.balance >= 0 ? 'var(--pastel-mint)' : 'var(--pastel-coral)',
                        border: `1px solid ${month.balance >= 0 ? 'var(--accent-success)' : 'var(--accent-error)'}20`
                      }}
                    >
                      <div className="fw-bold text-dark small mb-1">{month.month}</div>
                      <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                        <FiArrowUp size={12} className="text-success" />
                        <small className="text-success fw-medium">{formatCurrency(month.income)}</small>
                      </div>
                      <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                        <FiArrowDown size={12} className="text-danger" />
                        <small className="text-danger fw-medium">{formatCurrency(month.expense)}</small>
                      </div>
                      <div className={`fw-bold small ${month.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(month.balance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <FiActivity size={48} className="mb-3 opacity-50" />
                <p>Dati insufficienti per mostrare il trend</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Additional Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Row className="g-4">
          <Col xs={12} md={4}>
            <Card 
              className="h-100 border-0 shadow-sm glass-card"
              style={{
                borderRadius: '2rem',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Card.Body className="p-4 text-center">
                <FiCalendar className="text-primary mb-3" size={32} />
                <h5 className="fw-bold text-dark mb-2">Spesa Media Giornaliera</h5>
                <div className="fw-bold text-primary" style={{ fontSize: '1.5rem' }}>
                  {formatCurrency(stats.avgDailyExpense || 0)}
                </div>
                <small className="text-muted">Nel periodo selezionato</small>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={4}>
            <Card 
              className="h-100 border-0 shadow-sm glass-card"
              style={{
                borderRadius: '2rem',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Card.Body className="p-4 text-center">
                <FiDollarSign className="text-warning mb-3" size={32} />
                <h5 className="fw-bold text-dark mb-2">Transazione Media</h5>
                <div className="fw-bold text-warning" style={{ fontSize: '1.5rem' }}>
                  {formatCurrency(stats.avgTransactionAmount || 0)}
            </div>
                <small className="text-muted">Importo medio per transazione</small>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={4}>
            <Card 
              className="h-100 border-0 shadow-sm glass-card"
              style={{
                borderRadius: '2rem',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Card.Body className="p-4 text-center">
                <FiActivity className="text-info mb-3" size={32} />
                <h5 className="fw-bold text-dark mb-2">Transazioni Totali</h5>
                <div className="fw-bold text-info" style={{ fontSize: '1.5rem' }}>
                  {stats.transactionCount || 0}
            </div>
                <small className="text-muted">Nel periodo selezionato</small>
          </Card.Body>
        </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
};

export default React.memo(TransactionAnalytics); 