import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../../utils/firebase";
import { useNotification } from "../../utils/notificationUtils";
import { motion } from "framer-motion";
import { Form, Button, Alert } from "react-bootstrap";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiUserPlus } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from 'react-i18next';

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const notification = useNotification();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validazioni
    if (username.length < 3) {
      setError("L'username deve essere di almeno 3 caratteri");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      setLoading(false);
      return;
    }

    try {
      // Crea l'utente
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Aggiorna il profilo con l'username
      await updateProfile(user, {
        displayName: username
      });

      // Salva i dati utente aggiuntivi in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        displayName: username,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Salva anche un mapping username -> uid per il login
      await setDoc(doc(firestore, "usernames", username.toLowerCase()), {
        uid: user.uid,
        createdAt: new Date()
      });

      notification.success("Account creato con successo!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Errore durante la registrazione:", error);
      let errorMessage = "Errore durante la registrazione";
      
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email già in uso";
          break;
        case "auth/invalid-email":
          errorMessage = "Email non valida";
          break;
        case "auth/weak-password":
          errorMessage = "Password troppo debole";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Operazione non consentita";
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
            {t('register.backToHome')}
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
                  background: "rgba(16,185,129,0.13)",
                  color: "#10b981",
                  fontSize: "18px"
                }}
              >
                🚀
              </div>
              <div className="text-start">
                <h2 className="fw-semibold text-dark mb-0" style={{fontSize:'1.25rem'}}>{t('register.title')}</h2>
                <small className="text-muted" style={{fontSize:'0.95rem'}}>{t('register.subtitle')}</small>
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

          {/* Register Form */}
          <Form onSubmit={handleSubmit} autoComplete="on">
            <Form.Group className="mb-2" controlId="username">
              <Form.Label className="fw-semibold small">{t('register.username')}</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0" style={{padding:'0.5rem 0.7rem', fontSize:'1.1rem'}}><FiUser /></span>
                <Form.Control
                  type="text"
                  placeholder={t('register.usernamePlaceholder')}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
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
              <Form.Text className="text-muted small">{t('register.usernameHelp')}</Form.Text>
            </Form.Group>
            <Form.Group className="mb-2" controlId="email">
              <Form.Label className="fw-semibold small">{t('register.email')}</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0" style={{padding:'0.5rem 0.7rem', fontSize:'1.1rem'}}><FiMail /></span>
                <Form.Control
                  type="email"
                  placeholder={t('register.emailPlaceholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  autoComplete="email"
                />
              </div>
            </Form.Group>
            <Form.Text className="text-muted small">{t('register.usernameMin')}</Form.Text>
            <Form.Group className="mb-2" controlId="password">
              <Form.Label className="fw-semibold small">{t('register.password')}</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0" style={{padding:'0.5rem 0.7rem', fontSize:'1.1rem'}}><FiLock /></span>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder={t('register.passwordPlaceholder')}
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
                  autoComplete="new-password"
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
            <Form.Group className="mb-2" controlId="confirmPassword">
              <Form.Label className="fw-semibold small">{t('register.confirmPassword')}</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0" style={{padding:'0.5rem 0.7rem', fontSize:'1.1rem'}}><FiLock /></span>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
                  autoComplete="new-password"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
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
                background: 'rgba(16,185,129,0.93)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 1px 6px rgba(16,185,129,0.07)',
                transition: 'all 0.2s',
              }}
              disabled={loading}
            >
              <FiUserPlus className="me-2" /> {t('register.registerButton')}
            </Button>
            <div className="text-center mt-3">
              <span className="text-muted small">{t('register.haveAccount')}</span>{' '}
              <Link to="/login" className="fw-semibold" style={{ color: '#0d6efd', textDecoration: 'none' }}>{t('register.loginNow')}</Link>
            </div>
          </Form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
