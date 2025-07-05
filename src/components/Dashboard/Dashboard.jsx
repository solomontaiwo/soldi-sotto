import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Card, Row, Col, Button, Alert } from "react-bootstrap";
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiPieChart,
  FiList,
  FiPlus
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useMediaQuery } from "react-responsive";
import QuickTransactionForm from "./QuickTransactionForm";
import RecentTransactions from "./RecentTransactions";

// Bootstrap components will be used instead of Typography

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
  const [defaultTransactionType, setDefaultTransactionType] = useState("expense");
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Frasi motivazionali a rotazione
  const motivationalQuotes = [
    "Ogni euro risparmiato è un euro guadagnato.",
    "Il miglior investimento sei tu.",
    "Piccoli passi, grandi risultati.",
    "Gestire le tue finanze è il primo passo verso la libertà.",
    "Non contare i centesimi, falli contare!",
    "La ricchezza si costruisce un giorno alla volta.",
    "Il futuro appartiene a chi lo pianifica.",
    "Risparmiare oggi per vivere meglio domani.",
    "Non è quanto guadagni, ma quanto risparmi che conta.",
    "La disciplina finanziaria è la chiave del successo."
  ];
  const [quote, setQuote] = useState("");
  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  const quickActions = [
    {
      key: "add-income",
      title: "💰 Aggiungi Entrata",
      subtitle: "Stipendio, bonus, vendite...",
      icon: <FiTrendingUp size={24} />,
      color: "var(--accent-success)",
      bgColor: "var(--pastel-mint)",
      action: () => {
        setDefaultTransactionType("income");
        setShowQuickAdd(true);
      },
      disabled: isDemo && !canAddMoreTransactions,
      primary: true
    },
    {
      key: "add-expense",
      title: "💸 Aggiungi Spesa",
      subtitle: "Acquisti, bollette, cibo...",
      icon: <FiTrendingDown size={24} />,
      color: "var(--accent-error)",
      bgColor: "var(--pastel-coral)",
      action: () => {
        setDefaultTransactionType("expense");
        setShowQuickAdd(true);
      },
      disabled: isDemo && !canAddMoreTransactions,
      primary: true
    },
    {
      key: "view-transactions",
      title: "📋 Gestisci Tutto",
      subtitle: "Visualizza e modifica",
      icon: <FiList size={24} />,
      color: "var(--accent-info)",
      bgColor: "var(--pastel-sky)",
      action: () => navigate("/transactions"),
    },
    {
      key: "view-analytics",
      title: "📊 Vedi Statistiche",
      subtitle: "Analizza i tuoi dati",
      icon: <FiPieChart size={24} />,
      color: "var(--accent-warning)",
      bgColor: "var(--pastel-cream)",
      action: () => navigate("/analytics"),
    },
  ];

  const welcomeMessage = currentUser 
    ? `Ciao ${currentUser.email?.split("@")[0] || "Utente"}! 👋`
    : "Benvenuto in modalità Demo! 🎯";

  const handleQuickActionClick = (action) => {
    if (action.disabled) return;
    action.action();
  };

  return (
    <div style={{ 
      height: isMobile ? '100vh' : 'calc(100vh - 64px)',
      padding: isMobile ? '1rem' : undefined,
      paddingTop: isMobile ? undefined : 'var(--space-6)',
      maxWidth: '1200px',
      margin: '0 auto',
      color: 'var(--text-primary)',
      boxSizing: 'border-box',
      overflowY: 'auto',
      overflowX: 'hidden'
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
        }}>
          {welcomeMessage}
        </h2>
        <p className="text-muted mb-1" style={{ fontSize: '1.1rem' }}>
          {currentUser 
            ? "Cosa vuoi registrare oggi?"
            : "Inizia subito ad aggiungere le tue transazioni"
          }
        </p>
        <div className="text-primary fw-medium mb-0" style={{ fontSize: isMobile ? '1rem' : '1.15rem', opacity: 0.85 }}>
          <span style={{ fontStyle: 'italic' }}>{quote}</span>
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
          <Row className="g-4 align-items-stretch">
            <Col xs={12} lg={6}>
              <div className="h-100 d-flex flex-column justify-content-between">
                <div className="mb-4">
                  <h3 className="text-dark fw-semibold mb-3 d-flex align-items-center gap-2">
                    <FiPlus size={20} /> Azioni Rapide
                  </h3>
                  <Row className="g-3">
                    {quickActions.map((action) => (
                      <Col key={action.key} xs={12} sm={6}>
                        <Card
                          className="h-100 border-0 shadow-sm glass-card"
                          onClick={() => handleQuickActionClick(action)}
                          style={{
                            borderRadius: '2rem',
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            cursor: action.disabled ? 'not-allowed' : 'pointer',
                            opacity: action.disabled ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                            height: '120px',
                          }}
                          onMouseEnter={(e) => {
                            if (!action.disabled) {
                              e.currentTarget.style.transform = 'scale(1.04)';
                              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.15)';
                              e.currentTarget.style.borderColor = action.color + '60';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!action.disabled) {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '';
                              e.currentTarget.style.borderColor = action.color + '30';
                            }
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
              <FiPlus size={20} /> Azioni Rapide
            </h3>
            <Row className="g-3 w-100" style={{ maxWidth: 600 }}>
              {quickActions.map((action) => (
                <Col key={action.key} xs={12} sm={6}>
                  <Card
                    className="h-100 border-0 shadow-sm glass-card"
                    onClick={() => handleQuickActionClick(action)}
                    style={{
                      borderRadius: '2rem',
                      background: 'rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      cursor: action.disabled ? 'not-allowed' : 'pointer',
                      opacity: action.disabled ? 0.6 : 1,
                      transition: 'all 0.3s ease',
                      height: '120px',
                    }}
                    onMouseEnter={(e) => {
                      if (!action.disabled) {
                        e.currentTarget.style.transform = 'scale(1.04)';
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.15)';
                        e.currentTarget.style.borderColor = action.color + '60';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!action.disabled) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '';
                        e.currentTarget.style.borderColor = action.color + '30';
                      }
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
      <Modal
        show={showQuickAdd}
        onHide={() => setShowQuickAdd(false)}
        centered
        size="lg"
        backdrop={false}
        className="glass-modal"
        style={{
          background: "transparent"
        }}
      >
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
            zIndex: 1055,
            padding: "20px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQuickAdd(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              borderRadius: "40px",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              position: "relative"
            }}
          >
            {/* Decorative elements */}
            <div
              style={{
                position: "absolute",
                top: "-50%",
                right: "-10%",
                width: "200px",
                height: "200px",
                background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none"
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-30%",
                left: "-5%",
                width: "150px",
                height: "150px",
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none"
              }}
            />

            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-4 pb-0">
              <div>
                <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 197, 253, 0.15))",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(59, 130, 246, 0.2)"
                    }}
                  >
                    ⚡
                  </div>
                  Transazione Rapida
                </h3>
                <p className="text-muted mb-0 ms-5 ps-3" style={{ fontSize: "0.95rem" }}>
                  Aggiungi velocemente una nuova transazione
                </p>
              </div>
              <Button
                variant="link"
                onClick={() => setShowQuickAdd(false)}
                className="p-0 d-flex align-items-center justify-content-center"
                style={{ 
                  fontSize: "22px",
                  width: "44px",
                  height: "44px",
                  borderRadius: "22px",
                  background: 'var(--glass-bg, rgba(255,255,255,0.6))',
                  color: 'var(--text-primary, #222)',
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                  e.currentTarget.style.color = "#dc3545";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--glass-bg, rgba(255,255,255,0.6))";
                  e.currentTarget.style.color = "var(--text-primary, #222)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span style={{ color: 'inherit', fontWeight: 700 }}>×</span>
              </Button>
            </div>

            {/* Content */}
            <div 
              className="p-4 pt-3"
              style={{
                maxHeight: "calc(90vh - 120px)",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0,0,0,0.2) transparent"
              }}
            >
              <QuickTransactionForm 
                onSuccess={() => setShowQuickAdd(false)}
                onCancel={() => setShowQuickAdd(false)}
                defaultTransactionType={defaultTransactionType}
              />
            </div>
          </motion.div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard; 