import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col } from "react-bootstrap";
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
    canAddMoreTransactions
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
      padding: isMobile ? '0.5rem 0.5rem 1.5rem 0.5rem' : '2.5rem 0 0 0',
      maxWidth: '1200px',
      margin: '0 auto',
      color: 'var(--text-primary)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '0.5rem' : '1.5rem',
      minHeight: 0,
      background: 'var(--background-primary)',
    }}>
      {/* MOBILE: Titolo + motivazionale + Quick Actions + Recent Transactions */}
      {isMobile ? (
        <div style={{ width: '100%', margin: 0, padding: 0 }}>
          <div className="mb-2">
            <h2 className="text-dark fw-bold mb-1" style={{ fontSize: '1.35rem' }}>
          {currentUser ? t('welcome', { name: username }) : t('welcome', { name: 'Demo' })}
        </h2>
            <div className="text-primary fw-medium mb-2" style={{ fontSize: '1rem', opacity: 0.85 }}>
          <span style={{ fontStyle: 'italic' }}>{t('motivationalQuote')}</span>
        </div>
            <h3 className="text-dark fw-semibold mb-2 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
              <FiPlus size={18} /> {t('quickActions')}
            </h3>
            <Row className="g-2">
              {quickActions.map((action) => (
                <Col xs={12} key={action.key}>
                  <Card
                    className="border-0 shadow-sm glass-card dashboard-glass"
                    onClick={() => handleQuickActionClick(action)}
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,245,255,0.82) 100%)",
                      backdropFilter: "blur(18px)",
                      WebkitBackdropFilter: "blur(18px)",
                      border: "1.5px solid rgba(255,255,255,0.25)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      borderRadius: "18px",
                      minHeight: 60,
                      marginBottom: 0,
                      overflow: 'hidden',
                      padding: 0,
                    }}
                  >
                    <Card.Body className="d-flex flex-row align-items-center justify-content-start gap-3 p-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '36px', 
                          height: '36px', 
                          backgroundColor: action.color + '20',
                          color: action.color 
                        }}
                      >
                        {action.icon}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold text-dark" style={{ fontSize: '1rem', lineHeight: '1.2' }}>{action.title}</div>
                        <div className="text-muted small" style={{ fontSize: '0.85rem', opacity: 0.8 }}>{action.subtitle}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
          <RecentTransactions transactions={transactions} />
        </div>
      ) : (
        // DESKTOP: header e transazioni recenti in una sola riga compatta
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-3"
          style={{ flex: 1, minHeight: 0 }}
        >
          <Row className={'g-3 align-items-start'} style={{ height: '100%' }}>
            {/* Header + Quick Actions a sinistra */}
            <Col xs={12} md={6} lg={6} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="h-100 d-flex flex-column justify-content-start">
                <div className="mb-3">
                  <h2 className="text-dark fw-bold mb-1" style={{ fontSize: '2.1rem', marginTop: '0.5rem' }}>
                    {currentUser ? t('welcome', { name: username }) : t('welcome', { name: 'Demo' })}
                  </h2>
                  <div className="text-primary fw-medium mb-2" style={{ fontSize: '1.1rem', opacity: 0.85 }}>
                    <span style={{ fontStyle: 'italic' }}>{t('motivationalQuote')}</span>
                  </div>
                </div>
                <h3 className="text-dark fw-semibold mb-2 d-flex align-items-center gap-2" style={{ fontSize: '1.15rem' }}>
                  <FiPlus size={20} /> {t('quickActions')}
                </h3>
                <Row className="g-2">
                  {quickActions.map((action) => (
                    <Col xs={12} sm={12} md={12} lg={12} xxl={12} key={action.key} className="mb-2">
        <Card
                        className="border-0 shadow-sm glass-card dashboard-glass"
                        onClick={() => handleQuickActionClick(action)}
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,245,255,0.82) 100%)",
                          backdropFilter: "blur(18px)",
                          WebkitBackdropFilter: "blur(18px)",
                          border: "1.5px solid rgba(255,255,255,0.25)",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                          borderRadius: "18px",
                          minHeight: 60,
                          marginBottom: 0,
                          overflow: 'hidden',
                          padding: 0,
                        }}
                      >
                        <Card.Body className="d-flex flex-row align-items-center justify-content-start gap-3 p-3">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
                              width: '36px', 
                              height: '36px', 
                              backgroundColor: action.color + '20',
                              color: action.color 
                            }}
                          >
                            {action.icon}
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-semibold text-dark" style={{ fontSize: '1rem', lineHeight: '1.2' }}>{action.title}</div>
                            <div className="text-muted small" style={{ fontSize: '0.85rem', opacity: 0.8 }}>{action.subtitle}</div>
                          </div>
                        </Card.Body>
        </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
            {/* Recent Transactions a destra, allineate in alto */}
            <Col xs={12} lg={6} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start' }}>
              <RecentTransactions transactions={transactions} />
            </Col>
          </Row>
      </motion.div>
      )}

      {/* Financial Overview - solo desktop, compatta */}
      {/* RIMOSSO IL CARD VUOTO CHE CREAVA SPAZIO INUTILE */}
      {/* Quick Add Modal */}
      <TransactionModal
        show={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        transaction={null}
      />
    </div>
  );
};

export default React.memo(Dashboard); 