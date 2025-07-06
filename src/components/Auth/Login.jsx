import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../utils/firebase";
import { useNotification } from "../../utils/notificationUtils";
import { motion } from "framer-motion";
import { Form, Button, Alert } from "react-bootstrap";
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiLogIn } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [loginInput, setLoginInput] = useState(""); // Può essere email o username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const notification = useNotification();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  // Funzione per determinare se l'input è un email
  const isEmail = (input) => {
    return input.includes("@") && input.includes(".");
  };

  // Funzione per ottenere l'email dall'username
  const getEmailFromUsername = async (username) => {
    try {
      const usernameDoc = await getDoc(doc(firestore, "usernames", username.toLowerCase()));
      if (usernameDoc.exists()) {
        const uid = usernameDoc.data().uid;
        const userDoc = await getDoc(doc(firestore, "users", uid));
        if (userDoc.exists()) {
          return userDoc.data().email;
        }
      }
      return null;
    } catch (error) {
      console.error("Errore nella ricerca username:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let emailToUse = loginInput;

      // Se non è un email, cerca l'email associata all'username
      if (!isEmail(loginInput)) {
        const emailFromUsername = await getEmailFromUsername(loginInput);
        if (!emailFromUsername) {
          setError("Username non trovato");
          setLoading(false);
          return;
        }
        emailToUse = emailFromUsername;
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);
      notification.success("Accesso effettuato con successo!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Errore durante il login:", error);
      let errorMessage = "Errore durante l'accesso";
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = isEmail(loginInput) ? "Email non trovata" : "Username non trovato";
          break;
        case "auth/wrong-password":
          errorMessage = "Password non corretta";
          break;
        case "auth/invalid-email":
          errorMessage = "Email non valida";
          break;
        case "auth/too-many-requests":
          errorMessage = "Troppi tentativi. Riprova più tardi";
          break;
        case "auth/invalid-credential":
          errorMessage = "Credenziali non valide";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "var(--background-primary, #f8fafc)",
        padding: isMobile ? '8px' : '24px',
        position: "relative"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "370px",
          position: "relative"
        }}
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-3"
        >
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-decoration-none p-0 d-flex align-items-center gap-2"
            style={{ 
              fontSize: "13px",
              background: "rgba(255,255,255,0.18)",
              borderRadius: "10px",
              padding: "6px 14px",
              border: "1px solid rgba(0,0,0,0.07)",
              color: "#222",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.18)";
            }}
          >
            <FiArrowLeft size={15} />
            {t('login.backToHome')}
          </Button>
        </motion.div>

        {/* Main Container */}
        <div
          style={{
            background: "rgba(255,255,255,0.72)",
            borderRadius: "18px",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            padding: isMobile ? "16px" : "22px",
            position: "relative",
            backdropFilter: "blur(12px)",
            willChange: "transform"
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-3"
          >
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "38px",
                  height: "38px",
                  background: "rgba(13,110,253,0.13)",
                  color: "#0d6efd",
                  fontSize: "18px"
                }}
              >
                💰
              </div>
              <div className="text-start">
                <h2 className="fw-semibold text-dark mb-0" style={{fontSize:'1.25rem'}}>{t('login.title')}</h2>
                <small className="text-muted" style={{fontSize:'0.95rem'}}>{t('login.subtitle')}</small>
              </div>
            </div>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-3"
            >
              <Alert 
                variant="danger" 
                className="border-0"
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  borderRadius: "10px",
                  border: "1px solid rgba(239, 68, 68, 0.13)",
                  padding: "8px 12px"
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span>❌</span>
                  <span style={{ fontSize: "14px" }}>{error}</span>
                </div>
              </Alert>
            </motion.div>
          )}

          {/* Login Form */}
          <Form onSubmit={handleSubmit} autoComplete="on">
            <Form.Group className="mb-3" controlId="loginInput">
              <Form.Label className="fw-semibold small">{t('login.usernameOrEmail')}</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0" style={{padding:'0.5rem 0.7rem', fontSize:'1.1rem'}}><FiUser /></span>
                <Form.Control
                  type="text"
                  placeholder={t('login.usernameOrEmailPlaceholder')}
                  value={loginInput}
                  onChange={e => setLoginInput(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    fontSize: '1rem',
                    minHeight: '44px',
                    padding: '0.5rem 1rem',
                    color: '#222',
                    boxShadow: 'none',
                  }}
                  autoComplete="username"
                />
              </div>
              <Form.Text className="text-muted small">{t('login.usernameOrEmailHelp')}</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label className="fw-semibold small">{t('login.password')}</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0" style={{padding:'0.5rem 0.7rem', fontSize:'1.1rem'}}><FiLock /></span>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    fontSize: '1rem',
                    minHeight: '44px',
                    padding: '0.5rem 1rem',
                    color: '#222',
                    boxShadow: 'none',
                  }}
                  autoComplete="current-password"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#888',
                    fontSize: '1.1rem',
                    borderRadius: '0 10px 10px 0',
                    minHeight: '44px',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
              </div>
            </Form.Group>
            <Button
              type="submit"
              className="w-100 fw-semibold mt-2"
              style={{
                borderRadius: '10px',
                minHeight: '44px',
                fontSize: '1.08rem',
                background: 'rgba(13,110,253,0.93)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 1px 6px rgba(13,110,253,0.07)',
                transition: 'all 0.2s',
              }}
              disabled={loading}
            >
              <FiLogIn className="me-2" /> {t('login.loginButton')}
            </Button>
          </Form>

          {/* Register Link */}
          <div className="text-center mt-3">
            <span className="text-muted small">{t('login.noAccount')}</span>{' '}
            <Link to="/register" className="fw-semibold" style={{ color: '#0d6efd', textDecoration: 'none' }}>{t('login.registerNow')}</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
