import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Button, Alert } from "react-bootstrap";
import { FiPieChart, FiList, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useMediaQuery } from "react-responsive";
import TransactionModal from "../Transaction/TransactionModal";
import RecentTransactions from "./RecentTransactions";
import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../utils/firebase";
import { useTranslation } from 'react-i18next';

// Dashboard component: main homepage with quick actions and recent transactions
// Uses useMemo for static data and React.memo for performance

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    transactions, 
    isDemo, 
    canAddMoreTransactions, 
    maxTransactions 
  } = useUnifiedTransactions();
  
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [username, setUsername] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const loadUsername = async () => {
      if (currentUser?.uid) {
        const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || currentUser.displayName || currentUser.email?.split("@")[0] || "");
        } else {
          setUsername(currentUser.displayName || currentUser.email?.split("@")[0] || "");
        }
      }
    };
    loadUsername();
  }, [currentUser]);

  // Memoized list of quick actions for the user
  const quickActions = useMemo(() => [
    {
      key: "add-transaction",
      title: `➕ ${t('addTransaction')}`,
      subtitle: t('whatToRegister'),
      icon: <FiPlus size={24} />,
      color: "var(--accent-primary)",
      bgColor: "var(--pastel-sky)",
      action: () => setShowQuickAdd(true),
      disabled: isDemo && !canAddMoreTransactions,
      primary: true
    },
    {
      key: "view-transactions",
      title: `📋 ${t('manageAll')}`,
      subtitle: t('yourTransactions'),
      icon: <FiList size={24} />,
      color: "var(--accent-info)",
      bgColor: "var(--pastel-sky)",
      action: () => navigate("/transactions"),
    },
    {
      key: "view-analytics",
      title: `📊 ${t('navbar.analytics')}`,
      subtitle: t('landing.mainFeatures'),
      icon: <FiPieChart size={24} />,
      color: "var(--accent-warning)",
      bgColor: "var(--pastel-cream)",
      action: () => navigate("/analytics"),
    },
  ], [isDemo, canAddMoreTransactions, navigate, t]);

  // Handler for quick action click
  const handleQuickActionClick = (action) => {
    if (action.disabled) return;
    action.action();
  };

  // Main render: greeting, motivational quote, quick actions, and recent transactions
  return (
    <div style={{ 
      padding: isMobile ? '1rem' : undefined,
      maxWidth: '1200px',
      margin: '0 auto',
      color: 'var(--text-primary)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '1rem' : '2rem'
    }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 'var(--space-6)' }}
      >
        <h2 className="text-dark fw-bold mb-2" style={{ 
          fontSize: isMobile ? '1.75rem' : '2.5rem',
          marginTop: isMobile ? 0 : '2.5rem',
        }}>
          {currentUser ? t('welcome', { name: username }) : t('welcome', { name: 'Demo' })}
        </h2>
        <p className="text-muted mb-1" style={{ fontSize: '1.1rem' }}>
          {t('whatToRegister')}
        </p>
        <div className="text-primary fw-medium mb-0" style={{ fontSize: isMobile ? '1rem' : '1.15rem', opacity: 0.85 }}>
          <span style={{ fontStyle: 'italic' }}>{t('motivationalQuote')}</span>
        </div>
      </motion.div>

      {/* Demo Alert */}
      {isDemo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
                  <Alert variant="info" className="border-0" style={{ 
          borderRadius: '2rem',
          background: 'var(--pastel-sky)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
        }}>
            <Alert.Heading className="h6 fw-bold" style={{ color: 'var(--accent-info)' }}>
              🎯 Modalità Demo Attiva
            </Alert.Heading>
            <p className="mb-2">
              Hai utilizzato {transactions.length}/{maxTransactions} transazioni demo.
            </p>
            <Button 
              variant="link" 
              onClick={() => navigate("/register")}
              className="p-0 fw-medium text-decoration-none"
              style={{ color: 'var(--accent-info)' }}
            >
              Registrati per funzionalità complete →
            </Button>
          </Alert>
        </motion.div>
      )}

      {/* Griglia principale: Azioni Rapide + Transazioni Recenti */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-5"
      >
        {transactions.length > 0 ? (
          <Row className={isMobile ? 'g-3' : 'g-4 align-items-stretch'}>
            <Col xs={12} md={6} lg={6}>
              <div className="h-100 d-flex flex-column justify-content-between">
                <div className="mb-4">
                  <h3 className="text-dark fw-semibold mb-3 d-flex align-items-center gap-2">
                    <FiPlus size={20} /> {t('quickActions')}
                  </h3>
                  <Row className="g-3">
                    {quickActions.map((action) => (
                      <Col xs={12} sm={6} md={6} lg={6} xxl={3} key={action.key} className="mb-3" style={isMobile ? { width: '100%' } : {}}>
                        <Card
                          className="h-100 border-0 shadow-sm glass-card dashboard-glass"
                          onClick={() => handleQuickActionClick(action)}
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
                          <Card.Body className="d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                              style={{ 
                                width: '48px', 
                                height: '48px', 
                                backgroundColor: action.color + '20',
                                color: action.color 
                              }}
                            >
                              {action.icon}
                            </div>
                            <h6 className="text-dark fw-semibold mb-1" style={{ fontSize: '0.95rem', lineHeight: '1.2' }}>
                              {action.title}
                            </h6>
                            <small className="text-muted text-center" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                              {action.subtitle}
                            </small>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            </Col>
            <Col xs={12} lg={6}>
              <div className="h-100 d-flex flex-column justify-content-between">
                <RecentTransactions transactions={transactions} />
              </div>
            </Col>
          </Row>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: isMobile ? '40vh' : '50vh' }}>
            <h3 className="text-dark fw-semibold mb-4 d-flex align-items-center gap-2">
              <FiPlus size={20} /> {t('quickActions')}
            </h3>
            <Row className="g-3 w-100" style={{ maxWidth: 600 }}>
              {quickActions.map((action) => (
                <Col xs={12} sm={6} key={action.key}>
                  <Card
                    className="h-100 border-0 shadow-sm glass-card dashboard-glass"
                    onClick={() => handleQuickActionClick(action)}
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
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          backgroundColor: action.color + '20',
                          color: action.color 
                        }}
                      >
                        {action.icon}
                      </div>
                      <h6 className="text-dark fw-semibold mb-1" style={{ fontSize: '0.95rem', lineHeight: '1.2' }}>
                        {action.title}
                      </h6>
                      <small className="text-muted text-center" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                        {action.subtitle}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </motion.div>

      {/* Financial Overview - meno spazio sopra */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ marginTop: transactions.length > 0 ? 'var(--space-4)' : 'var(--space-6)' }}
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
        </Card>
      </motion.div>

      {/* Quick Add Modal */}
      <TransactionModal
        show={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSubmit={() => setShowQuickAdd(false)}
        transaction={null}
      />
    </div>
  );
};

export default React.memo(Dashboard); 