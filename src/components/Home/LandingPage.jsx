import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Button, 
  Card, 
  Row, 
  Col, 
  Container
} from "react-bootstrap";
import {
  FiDollarSign,
  FiBarChart2,
  FiFileText,
  FiShield,
  FiStar,
  FiPlay,
  FiLogIn,
  FiUserPlus,
  FiAward,
  FiClock,
  FiCheck,
} from "react-icons/fi";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useMediaQuery } from "react-responsive";

const LandingPage = () => {
  const { currentUser } = useAuth();
  const { generateSampleTransactions, isDemo } = useUnifiedTransactions();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isStartingDemo, setIsStartingDemo] = useState(false);

  const handleStartDemo = async () => {
    setIsStartingDemo(true);
    
    // Genera transazioni demo se non è già in modalità demo
    if (!isDemo && !currentUser) {
      await generateSampleTransactions();
    }
    
    // Naviga alla dashboard
    setTimeout(() => {
      navigate("/transactions");
      setIsStartingDemo(false);
    }, 1000);
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: <FiDollarSign size={32} className="text-success" />,
      title: "Gestione Completa",
      description: "Traccia entrate e uscite con categorie personalizzate e descrizioni dettagliate."
    },
    {
      icon: <FiBarChart2 size={32} className="text-primary" />,
      title: "Statistiche Avanzate",
      description: "Visualizza i tuoi dati finanziari con grafici e report dettagliati."
    },
    {
      icon: <FiFileText size={32} className="text-info" />,
      title: "Export PDF",
      description: "Genera report PDF professionali per periodi personalizzati."
    },
    {
      icon: <FiShield size={32} className="text-warning" />,
      title: "Sicurezza Totale",
      description: "I tuoi dati sono protetti con crittografia e backup automatico."
    },
  ];

  const stats = [
    { title: "Utenti Attivi", value: "10,000+", icon: <FiStar /> },
    { title: "Transazioni", value: "500K+", icon: <FiAward /> },
    { title: "Tempo Risparmiato", value: "2h/giorno", icon: <FiClock /> },
  ];

  const demoFeatures = [
    "✓ Fino a 10 transazioni demo",
    "✓ Tutte le funzionalità base",
    "✓ Visualizzazione statistiche",
    "✓ Nessuna registrazione richiesta",
  ];

  const premiumFeatures = [
    "✓ Transazioni illimitate",
    "✓ Export PDF avanzato",
    "✓ Statistiche dettagliate",
    "✓ Backup cloud sicuro",
    "✓ Supporto prioritario",
  ];

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
      }}
    >
      {/* Hero Section */}
      <Container className="py-5">
        <div 
          className="text-center text-white"
          style={{ paddingTop: isMobile ? "40px" : "80px", paddingBottom: "60px" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 
              className="fw-bold mb-4"
              style={{ 
                fontSize: isMobile ? "2.5rem" : "4rem",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}
            >
              Soldi Sotto
            </h1>
            
            <p 
              className="mb-5"
              style={{ 
                fontSize: isMobile ? "1.2rem" : "1.5rem",
                maxWidth: "800px",
                margin: "0 auto 3rem auto",
                opacity: 0.95
              }}
            >
              La tua finanza personale sotto controllo. Gestisci entrate e uscite, 
              visualizza statistiche dettagliate e prendi decisioni informate per il tuo futuro finanziario.
            </p>

            <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-row'} justify-content-center gap-3 mb-5`}>
              <Button
                variant="success"
                size="lg"
                disabled={isStartingDemo}
                onClick={handleStartDemo}
                className="d-flex align-items-center justify-content-center gap-2"
                style={{
                  minWidth: "200px",
                  borderRadius: "25px",
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                }}
              >
                {isStartingDemo ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Avvio Demo...
                  </>
                ) : (
                  <>
                    <FiPlay size={20} />
                    Prova Demo Gratuita
                  </>
                )}
              </Button>

              <Button
                variant="outline-light"
                size="lg"
                onClick={handleRegister}
                className="d-flex align-items-center justify-content-center gap-2"
                style={{
                  minWidth: "200px",
                  borderRadius: "25px",
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderWidth: "2px"
                }}
              >
                <FiUserPlus size={20} />
                Registrati Gratis
              </Button>

              <Button
                variant="link"
                size="lg"
                onClick={handleLogin}
                className="text-white text-decoration-none d-flex align-items-center justify-content-center gap-2"
                style={{
                  fontSize: "16px",
                  fontWeight: "500"
                }}
              >
                <FiLogIn size={20} />
                Accedi
              </Button>
            </div>

            {/* Statistics */}
            <Row className="g-4 justify-content-center mb-5">
              {stats.map((stat, index) => (
                <Col key={index} xs={4} sm={3} md={2}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-white-50 mb-2" style={{ fontSize: "1.5rem" }}>
                      {stat.icon}
                    </div>
                    <div 
                      className="fw-bold text-white"
                      style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-white-50 small">
                      {stat.title}
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </div>
      </Container>

      {/* Features Section */}
      <div className="py-5">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-5"
          >
            <h2 className="fw-bold text-dark mb-4">Funzionalità Principali</h2>
            <p className="text-muted fs-5">
              Tutto quello che ti serve per gestire le tue finanze in modo professionale
            </p>
          </motion.div>

          <Row className="g-4">
            {features.map((feature, index) => (
              <Col key={index} xs={12} sm={6} lg={3}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Card
                    className="h-100 border-0 shadow-sm text-center"
                    style={{
                      borderRadius: "15px",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="mb-3">
                        {feature.icon}
                      </div>
                      <h5 className="fw-bold text-dark mb-3">
                        {feature.title}
                      </h5>
                      <p className="text-muted mb-0">
                        {feature.description}
                      </p>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Pricing Section */}
      <Container className="py-5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-5"
        >
          <h2 className="fw-bold text-white mb-4">Inizia Oggi Stesso</h2>
          <p className="text-white-50 fs-5">
            Scegli come iniziare il tuo viaggio verso la libertà finanziaria
          </p>
        </motion.div>

        <Row className="g-4 justify-content-center">
          {/* Demo Card */}
          <Col xs={12} md={6} lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card
                className="h-100 border-0 shadow-lg"
                style={{
                  borderRadius: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "3px solid #198754"
                }}
              >
                <Card.Body className="p-4 text-center">
                  <div className="mb-4" style={{ fontSize: "3rem" }}>
                    🚀
                  </div>
                  <h3 className="fw-bold text-dark mb-3">Demo Gratuita</h3>
                  <div className="display-4 fw-bold text-success mb-3">Gratis</div>
                  <p className="text-muted mb-4">
                    Prova subito senza registrazione
                  </p>
                  
                  <div className="text-start mb-4">
                    {demoFeatures.map((feature, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <FiCheck className="text-success me-2" />
                        <span className="text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="success"
                    size="lg"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    disabled={isStartingDemo}
                    onClick={handleStartDemo}
                    style={{
                      borderRadius: "15px",
                      padding: "12px",
                      fontWeight: "600"
                    }}
                  >
                    {isStartingDemo ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Avvio Demo...
                      </>
                    ) : (
                      <>
                        <FiPlay size={20} />
                        Inizia Demo
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          {/* Premium Card */}
          <Col xs={12} md={6} lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card
                className="h-100 border-0 shadow-lg position-relative"
                style={{
                  borderRadius: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "3px solid #0d6efd",
                  transform: "scale(1.05)"
                }}
              >
                <div 
                  className="position-absolute top-0 start-50 translate-middle"
                  style={{
                    backgroundColor: "#0d6efd",
                    color: "white",
                    padding: "8px 24px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                >
                  CONSIGLIATO
                </div>
                <Card.Body className="p-4 text-center pt-5">
                  <div className="mb-4" style={{ fontSize: "3rem" }}>
                    🏆
                  </div>
                  <h3 className="fw-bold text-dark mb-3">Account Completo</h3>
                  <div className="display-4 fw-bold text-primary mb-3">Gratis</div>
                  <p className="text-muted mb-4">
                    Tutte le funzionalità incluse
                  </p>
                  
                  <div className="text-start mb-4">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <FiCheck className="text-primary me-2" />
                        <span className="text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleRegister}
                    style={{
                      borderRadius: "15px",
                      padding: "12px",
                      fontWeight: "600"
                    }}
                  >
                    <FiUserPlus size={20} />
                    Registrati Ora
                  </Button>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Footer CTA */}
      <div className="py-5 text-center">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <h3 className="fw-bold text-dark mb-4">
              Pronto a Prendere il Controllo delle Tue Finanze?
            </h3>
            <p className="text-muted fs-5 mb-4">
              Unisciti a migliaia di utenti che hanno già trasformato la loro gestione finanziaria
            </p>
            
            <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-row'} justify-content-center gap-3`}>
              <Button
                variant="success"
                size="lg"
                disabled={isStartingDemo}
                onClick={handleStartDemo}
                className="d-flex align-items-center justify-content-center gap-2"
                style={{
                  minWidth: "200px",
                  borderRadius: "25px",
                  padding: "12px 24px",
                  fontWeight: "600"
                }}
              >
                {isStartingDemo ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Avvio Demo...
                  </>
                ) : (
                  <>
                    <FiPlay size={20} />
                    Prova Demo Ora
                  </>
                )}
              </Button>
              
              <Button
                variant="outline-primary"
                size="lg"
                onClick={handleRegister}
                className="d-flex align-items-center justify-content-center gap-2"
                style={{
                  minWidth: "200px",
                  borderRadius: "25px",
                  padding: "12px 24px",
                  fontWeight: "600",
                  borderWidth: "2px"
                }}
              >
                <FiUserPlus size={20} />
                Registrati Gratis
              </Button>
            </div>
          </motion.div>
        </Container>
      </div>
    </div>
  );
};

export default LandingPage; 