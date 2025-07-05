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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: isMobile ? '20px' : '40px',
        position: "relative"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "480px",
          position: "relative"
        }}
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-decoration-none p-0 d-flex align-items-center gap-2 text-white"
            style={{ 
              fontSize: "14px",
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              padding: "8px 16px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            }}
          >
            <FiArrowLeft size={16} />
            Torna alla Home
          </Button>
        </motion.div>

        {/* Main Container */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            padding: isMobile ? "24px" : "32px",
            position: "relative",
            willChange: "transform"
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-4"
          >
            <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "52px",
                  height: "52px",
                  background: "linear-gradient(135deg, #10b981, #047857)",
                  color: "white",
                  fontSize: "24px"
                }}
              >
                🚀
              </div>
              <div className="text-start">
                <h2 className="fw-bold text-dark mb-0">Crea Account</h2>
                <small className="text-muted">Inizia il tuo viaggio finanziario</small>
              </div>
            </div>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4"
            >
              <Alert 
                variant="danger" 
                className="border-0"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  borderRadius: "12px",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  padding: "12px 16px"
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
          <Form onSubmit={handleSubmit}>
            {/* Username and Email in a row for desktop */}
            <div className={`${isMobile ? 'd-block' : 'd-flex'} gap-3 mb-3`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={isMobile ? 'mb-3' : 'flex-fill'}
              >
                <Form.Group>
                  <Form.Label className="fw-semibold text-dark small mb-2">
                    Username
                  </Form.Label>
                  <div className="position-relative">
                    <FiUser 
                      className="position-absolute top-50 translate-middle-y text-muted"
                      style={{ left: "14px", zIndex: 10 }}
                      size={16}
                    />
                    <Form.Control
                      type="text"
                      placeholder="scegli un username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="border-0"
                      style={{
                        paddingLeft: "44px",
                        height: "48px",
                        borderRadius: "12px",
                        fontSize: "15px",
                        background: "rgba(248, 249, 250, 0.8)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        fontWeight: "500"
                      }}
                    />
                  </div>
                  {!isMobile && (
                    <Form.Text className="text-muted small">
                      Min. 3 caratteri
                    </Form.Text>
                  )}
                </Form.Group>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={!isMobile ? 'flex-fill' : ''}
              >
                <Form.Group>
                  <Form.Label className="fw-semibold text-dark small mb-2">
                    Email
                  </Form.Label>
                  <div className="position-relative">
                    <FiMail 
                      className="position-absolute top-50 translate-middle-y text-muted"
                      style={{ left: "14px", zIndex: 10 }}
                      size={16}
                    />
                    <Form.Control
                      type="email"
                      placeholder="la tua email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-0"
                      style={{
                        paddingLeft: "44px",
                        height: "48px",
                        borderRadius: "12px",
                        fontSize: "15px",
                        background: "rgba(248, 249, 250, 0.8)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        fontWeight: "500"
                      }}
                    />
                  </div>
                </Form.Group>
              </motion.div>
            </div>

            {/* Password fields in a row for desktop */}
            <div className={`${isMobile ? 'd-block' : 'd-flex'} gap-3 mb-4`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={isMobile ? 'mb-3' : 'flex-fill'}
              >
                <Form.Group>
                  <Form.Label className="fw-semibold text-dark small mb-2">
                    Password
                  </Form.Label>
                  <div className="position-relative">
                    <FiLock 
                      className="position-absolute top-50 translate-middle-y text-muted"
                      style={{ left: "14px", zIndex: 10 }}
                      size={16}
                    />
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="crea una password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-0"
                      style={{
                        paddingLeft: "44px",
                        paddingRight: "44px",
                        height: "48px",
                        borderRadius: "12px",
                        fontSize: "15px",
                        background: "rgba(248, 249, 250, 0.8)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        fontWeight: "500"
                      }}
                    />
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="position-absolute top-50 translate-middle-y border-0 text-muted p-0"
                      style={{ right: "14px", zIndex: 10 }}
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </Button>
                  </div>
                </Form.Group>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={!isMobile ? 'flex-fill' : ''}
              >
                <Form.Group>
                  <Form.Label className="fw-semibold text-dark small mb-2">
                    Conferma Password
                  </Form.Label>
                  <div className="position-relative">
                    <FiLock 
                      className="position-absolute top-50 translate-middle-y text-muted"
                      style={{ left: "14px", zIndex: 10 }}
                      size={16}
                    />
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="ripeti la password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-0"
                      style={{
                        paddingLeft: "44px",
                        paddingRight: "44px",
                        height: "48px",
                        borderRadius: "12px",
                        fontSize: "15px",
                        background: "rgba(248, 249, 250, 0.8)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        fontWeight: "500"
                      }}
                    />
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="position-absolute top-50 translate-middle-y border-0 text-muted p-0"
                      style={{ right: "14px", zIndex: 10 }}
                    >
                      {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </Button>
                  </div>
                </Form.Group>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-100 border-0 fw-semibold mb-4"
                style={{
                  height: "50px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #10b981, #047857)",
                  fontSize: "16px",
                  transition: "transform 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Creazione account...
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <FiUserPlus size={18} />
                    Crea Account
                  </div>
                )}
              </Button>
            </motion.div>
          </Form>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <p className="text-muted mb-0 small">
              Hai già un account?{" "}
              <Link 
                to="/login" 
                className="text-decoration-none fw-semibold"
                style={{ 
                  color: "#10b981",
                  transition: "color 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#047857";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#10b981";
                }}
              >
                Accedi ora
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
