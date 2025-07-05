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

const Login = () => {
  const [loginInput, setLoginInput] = useState(""); // Può essere email o username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const notification = useNotification();
  const isMobile = useMediaQuery({ maxWidth: 768 });

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
          maxWidth: "440px",
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
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white",
                  fontSize: "24px"
                }}
              >
                💰
              </div>
              <div className="text-start">
                <h2 className="fw-bold text-dark mb-0">Bentornato!</h2>
                <small className="text-muted">Accedi con il tuo account</small>
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

          {/* Login Form */}
          <Form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark small mb-2">
                  Username o Email
                </Form.Label>
                <div className="position-relative">
                  <FiUser 
                    className="position-absolute top-50 translate-middle-y text-muted"
                    style={{ left: "14px", zIndex: 10 }}
                    size={16}
                  />
                  <Form.Control
                    type="text"
                    placeholder="username o email"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
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
                <Form.Text className="text-muted small">
                  Inserisci la email di registrazione per accedere
                </Form.Text>
              </Form.Group>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Form.Group className="mb-4">
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
                    placeholder="inserisci la tua password"
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
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-100 border-0 fw-semibold mb-4"
                style={{
                  height: "50px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
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
                    Accesso in corso...
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <FiLogIn size={18} />
                    Accedi
                  </div>
                )}
              </Button>
            </motion.div>
          </Form>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p className="text-muted mb-0 small">
              Non hai un account?{" "}
              <Link 
                to="/register" 
                className="text-decoration-none fw-semibold"
                style={{ 
                  color: "#667eea",
                  transition: "color 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#764ba2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#667eea";
                }}
              >
                Registrati ora
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
