import { Card, Row, Col, Button, Form, Modal } from "react-bootstrap";
import { 
  FiMail, 
  FiCalendar, 
  FiTrendingUp, 
  FiPieChart, 
  FiClock, 
  FiSettings,
  FiUser,
  FiLogOut,
  FiEdit,
  FiCheck,
  FiX
} from "react-icons/fi";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useTheme } from "../../utils/ThemeProvider";
import { useNotification } from "../../utils/notificationUtils";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { firestore } from "../../utils/firebase";
import formatCurrency from "../../utils/formatCurrency";
import React from "react";
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Profile component: shows user profile and statistics
// Uses useMemo for profileStats and themeOptions for performance
const Profile = () => {
  const { currentUser, loading: userLoading, logout } = useAuth();
  const { transactions, getStats, loading: transactionsLoading } = useUnifiedTransactions();
  const loading = userLoading || transactionsLoading;
  const { theme, toggleTheme } = useTheme();
  const notification = useNotification();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [userStats, setUserStats] = useState({});
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (getStats) {
      setUserStats(getStats());
    }
  }, [transactions, getStats]);

  useEffect(() => {
    // Carica username corrente sempre da Firestore se possibile
    const loadCurrentUsername = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
          if (userDoc.exists()) {
            setCurrentUsername(userDoc.data().username || currentUser.displayName || currentUser.email?.split("@")[0] || "");
          } else {
            setCurrentUsername(currentUser.displayName || currentUser.email?.split("@")[0] || "");
          }
        } catch (error) {
          console.error("Errore nel caricamento username:", error);
        }
      }
    };
    loadCurrentUsername();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    toggleTheme(selectedTheme);
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const usernameDoc = await getDoc(doc(firestore, "usernames", username.toLowerCase()));
      return !usernameDoc.exists();
    } catch (error) {
      console.error("Errore nel controllo username:", error);
      return false;
    }
  };

  const handleUsernameChange = async () => {
    if (!newUsername.trim() || newUsername.length < 3) {
      notification.error(t('profile.usernameMinLength'));
      return;
    }

    if (newUsername.toLowerCase() === currentUsername.toLowerCase()) {
      notification.info(t('profile.usernameSame'));
      setShowUsernameModal(false);
      return;
    }

    const confirmed = window.confirm(
      t('profile.usernameConfirm', { currentUsername, newUsername })
    );
    if (!confirmed) return;

    setUsernameLoading(true);

    try {
      // 1. Verifica disponibilità
      const isAvailable = await checkUsernameAvailability(newUsername);
      if (!isAvailable) {
        notification.error(t('profile.usernameUnavailable'));
        return;
      }

      // 2. Crea nuovo mapping username
      await setDoc(doc(firestore, "usernames", newUsername.toLowerCase()), {
        uid: currentUser.uid,
        createdAt: new Date()
      });

      // 3. Aggiorna (o crea) documento utente in Firestore
      await setDoc(doc(firestore, "users", currentUser.uid), {
        username: newUsername.toLowerCase(),
        displayName: newUsername,
        updatedAt: new Date()
      }, { merge: true });

      // 4. Aggiorna profilo Firebase Auth
      await updateProfile(currentUser, {
        displayName: newUsername
      });

      // 5. Elimina il vecchio mapping username (se diverso)
      if (currentUsername && currentUsername.toLowerCase() !== newUsername.toLowerCase()) {
        try {
          await deleteDoc(doc(firestore, "usernames", currentUsername.toLowerCase()));
        } catch (deleteError) {
          console.warn("Errore nella rimozione del vecchio username (non critico):", deleteError);
        }
      }

      // 6. Aggiorna stato locale ricaricando il documento utente
      const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
      if (userDoc.exists()) {
        setCurrentUsername(userDoc.data().username);
      } else {
        setCurrentUsername(newUsername);
      }
      setNewUsername("");
      notification.success(t('profile.usernameSuccess'));
    } catch (error) {
      console.error("Errore nell'aggiornamento username:", error);
      let errorMessage = t('profile.usernameError');
      if (error.code === "permission-denied") {
        errorMessage = t('profile.usernamePermissionError');
      } else if (error.code === "network-request-failed") {
        errorMessage = t('profile.usernameNetworkError');
      }
      notification.error(errorMessage);
    } finally {
      setUsernameLoading(false);
      setShowUsernameModal(false);
    }
  };

  // Calcola la data di registrazione
  const registrationDate = currentUser?.metadata?.creationTime 
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString("it-IT")
    : t('profile.dateNotAvailable');

  const userInitials = currentUser?.email 
    ? currentUser.email.charAt(0).toUpperCase()
    : "?";

  // Memoized list of profile statistics
  const profileStats = useMemo(() => [
    {
      title: t('profile.totalTransactions'),
      value: transactions.length,
      icon: <FiPieChart size={20} />,
      suffix: "",
      color: "var(--accent-info)",
      bgColor: "var(--pastel-sky)"
    },
    {
      title: t('profile.currentBalance'),
      value: userStats.balance || 0,
      icon: <FiTrendingUp size={20} />,
      formatter: (value) => formatCurrency(value),
      color: userStats.balance >= 0 ? "var(--accent-success)" : "var(--accent-error)",
      bgColor: userStats.balance >= 0 ? "var(--pastel-mint)" : "var(--pastel-coral)"
    },
    {
      title: t('profile.daysActive'),
      value: currentUser?.metadata?.creationTime 
        ? Math.floor((Date.now() - new Date(currentUser.metadata.creationTime)) / (1000 * 60 * 60 * 24))
        : 0,
      icon: <FiClock size={20} />,
      suffix: ` ${t('profile.days')}`,
      color: "var(--accent-warning)",
      bgColor: "var(--pastel-cream)"
    },
  ], [transactions.length, userStats.balance, currentUser?.metadata?.creationTime, t]);

  // Memoized list of theme options for theme switcher
  const themeOptions = useMemo(() => [
    { value: "light", label: t('profile.themeLight') },
    { value: "dark", label: t('profile.themeDark') },
    { value: "system", label: t('profile.themeSystem') }
  ], [t]);

  // Memoized list of language options
  const languageOptions = [
    { value: 'it', label: 'Italiano' },
    { value: 'en', label: 'English' }
  ];
  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem('appLanguage', e.target.value);
  };

  // Main render: user info, statistics, and theme switcher
  if (loading) {
    // Skeleton ultra-minimal per avatar, statistiche e box principali
    return (
      <div className="container py-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <Skeleton circle width={64} height={64} />
          <div className="flex-grow-1">
            <Skeleton height={22} width={180} style={{ marginBottom: 8 }} />
            <Skeleton height={16} width={120} />
          </div>
        </div>
        <div className="row g-4 mb-4">
          {[...Array(3)].map((_, i) => (
            <div className="col-12 col-md-4" key={i}>
              <Skeleton height={90} borderRadius={18} />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <Skeleton height={180} borderRadius={24} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? '1rem 0' : '2rem 0',
      maxWidth: '1000px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: 'var(--background-primary)',
      color: 'var(--text-primary)',
    }}>
      {/* Header con Avatar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <Card
          className="border-0 shadow-sm text-center glass-card"
          style={{
            borderRadius: '2rem',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <Card.Body className="p-5">
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4"
              style={{
                width: '100px',
                height: '100px',
                background: 'var(--gradient-soft-blue)',
                color: 'var(--primary-600)',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                border: "3px solid rgba(59, 130, 246, 0.2)"
              }}
            >
              {userInitials}
            </div>
            
            <h3 className="text-dark fw-bold mb-3">
              {currentUsername || t('profile.user')}
            </h3>
            
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <FiMail className="text-muted" size={16} />
              <span className="text-muted">
                {currentUser?.email}
              </span>
            </div>
            
            <div className="d-flex align-items-center justify-content-center gap-2">
              <FiCalendar className="text-muted" size={16} />
              <span className="text-muted">
                {t('profile.registeredOn')} {registrationDate}
              </span>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Statistiche Profilo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-4"
      >
        <h4 className="text-dark fw-semibold mb-4 d-flex align-items-center gap-2">
          <FiTrendingUp size={20} />
          {t('profile.statsTitle')}
        </h4>
        
        <Row className="g-3">
          {profileStats.map((stat, index) => (
            <Col key={index} xs={12} sm={4}>
              <Card
                className="border-0 shadow-sm text-center h-100 glass-card"
                style={{
                  borderRadius: '1.5rem',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <Card.Body className="p-4">
                  <div 
                    className="mb-3 rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: stat.color + '20',
                      color: stat.color 
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div className="mb-2">
                    <div
                      className="fw-bold text-dark"
                      style={{ fontSize: '1.5rem' }}
                    >
                      {stat.formatter ? stat.formatter(stat.value) : stat.value}
                      {stat.suffix && <span className="text-muted fs-6">{stat.suffix}</span>}
                    </div>
                  </div>
                  <div className="text-muted fw-medium small">
                    {stat.title}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Impostazioni */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-4"
      >
        <h4 className="text-dark fw-semibold mb-3 d-flex align-items-center gap-2">
          <FiSettings size={20} />
          {t('profile.settingsTitle')}
        </h4>
        <div className="d-flex flex-column gap-4">
          {/* Apparenza */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-medium text-dark">{t('profile.theme')}</div>
              <Form.Select
                value={theme}
                onChange={handleThemeChange}
                style={{
                  width: "140px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "transparent",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)"
                }}
              >
                {themeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="text-muted small mb-2">{t('profile.currentTheme')}: {theme === "dark" ? t('profile.themeDark') : theme === "light" ? t('profile.themeLight') : t('profile.themeSystem')}</div>
            <hr className="my-2" style={{ opacity: 0.12 }} />
          </div>
          {/* Lingua applicazione */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-medium text-dark">{t('profile.language')}</div>
              <Form.Select
                value={i18n.language.split('-')[0]}
                onChange={handleLanguageChange}
                style={{
                  width: "140px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "transparent",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)"
                }}
              >
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="text-muted small mb-2">{t('profile.currentLanguage')}: {i18n.language === 'it' ? 'Italiano' : 'English'}</div>
            <hr className="my-2" style={{ opacity: 0.12 }} />
          </div>
          {/* Account */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-medium text-dark">{t('profile.username')}</div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  setNewUsername(currentUsername);
                  setShowUsernameModal(true);
                }}
                className="d-flex align-items-center gap-2"
                style={{ borderRadius: "8px", fontSize: "14px", background: "transparent", border: "1px solid var(--primary-300)", color: "var(--primary-600)" }}
              >
                <FiEdit size={12} />
                {t('profile.edit')}
              </Button>
            </div>
            <div className="text-muted small mb-2">{t('profile.currentUsername')}: {currentUsername}</div>
            <hr className="my-2" style={{ opacity: 0.12 }} />
          </div>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mb-4"
      >
        <div style={{
          borderRadius: 0,
          background: "none",
          border: "none",
          padding: 0,
          margin: 0
        }}>
          <div className="d-flex align-items-center gap-2 mb-1" style={{ fontWeight: 500, color: "var(--primary-600)" }}>
            <FiUser size={16} />
            {t('profile.account')}: {currentUser?.email}
          </div>
          <div className="text-muted small">
            {t('profile.accountInfo')}
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="d-flex justify-content-center gap-3 flex-wrap"
      >
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard")}
          style={{
            borderRadius: '20px',
            minWidth: '160px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
            border: 'none'
          }}
        >
          {t('profile.backToDashboard')}
        </Button>
        
        <Button
          variant="outline-danger"
          onClick={handleLogout}
          className="d-flex align-items-center gap-2"
          style={{
            borderRadius: '20px',
            minWidth: '160px',
            padding: '12px 24px',
            backgroundColor: 'var(--pastel-coral)',
            borderColor: 'var(--accent-error)',
            color: 'var(--accent-error)'
          }}
        >
          <FiLogOut size={16} />
          {t('logout')}
        </Button>
      </motion.div>

      {/* Username Change Modal */}
      <Modal 
        show={showUsernameModal} 
        onHide={() => setShowUsernameModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header 
          closeButton
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderBottom: '1px solid var(--border-primary)'
          }}
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            <FiEdit size={20} />
            {t('profile.editUsername')}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{ backgroundColor: 'var(--surface-primary)' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-dark">
                {t('profile.newUsername')}
              </Form.Label>
              <Form.Control
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t('profile.usernamePlaceholder')}
                disabled={usernameLoading}
                style={{
                  borderRadius: "8px",
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border-primary)'
                }}
              />
              <Form.Text className="text-muted">
                {t('profile.usernameHelp')}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        
        <Modal.Footer 
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderTop: '1px solid var(--border-primary)'
          }}
        >
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowUsernameModal(false)}
            disabled={usernameLoading}
          >
            <FiX size={16} className="me-1" />
            {t('cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUsernameChange}
            disabled={usernameLoading || !newUsername.trim() || newUsername.length < 3}
          >
            {usernameLoading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">{t('loading')}</span>
                </div>
                {t('profile.updating')}
              </>
            ) : (
              <>
                <FiCheck size={16} className="me-1" />
                {t('confirm')}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default React.memo(Profile); 