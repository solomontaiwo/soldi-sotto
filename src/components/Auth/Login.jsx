import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../utils/firebase";
import { useNotification } from "../../utils/notificationUtils";
import { motion } from "framer-motion";
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiLogIn, FiUser } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const Login = () => {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const notification = useNotification();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  const isEmail = (input) => input.includes("@") && input.includes(".");

  const getEmailFromUsername = async (username) => {
    try {
      const usernameDoc = await getDoc(doc(firestore, "usernames", username.toLowerCase()));
      if (usernameDoc.exists()) {
        const uid = usernameDoc.data().uid;
        const userDoc = await getDoc(doc(firestore, "users", uid));
        if (userDoc.exists()) return userDoc.data().email;
      }
      return null;
    } catch (err) {
      console.error("Errore nella ricerca username:", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let emailToUse = loginInput;
      if (!isEmail(loginInput)) {
        const emailFromUsername = await getEmailFromUsername(loginInput);
        if (!emailFromUsername) {
          setError(t("errors.usernameNotFound"));
          setLoading(false);
          return;
        }
        emailToUse = emailFromUsername;
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);
      notification.success("Accesso effettuato con successo!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Errore durante il login:", err);
      let errorMessage = t("errors.loginError");
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = isEmail(loginInput) ? t("errors.emailNotFound") : t("errors.usernameNotFound");
          break;
        case "auth/wrong-password":
          errorMessage = t("errors.wrongPassword");
          break;
        case "auth/invalid-email":
          errorMessage = t("errors.invalidEmail");
          break;
        case "auth/too-many-requests":
          errorMessage = t("errors.tooManyRequests");
          break;
        case "auth/invalid-credential":
          errorMessage = t("errors.invalidCredentials");
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-xl"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4 gap-2 text-muted-foreground"
        >
          <FiArrowLeft className="h-4 w-4" />
          {t("login.backToHome")}
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl">
            💰
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{t("login.title")}</h2>
            <p className="text-muted-foreground text-sm">{t("login.subtitle")}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginInput">{t("login.usernameOrEmail")}</Label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <FiUser className="text-muted-foreground" />
              <Input
                id="loginInput"
                type="text"
                placeholder={t("login.usernameOrEmailPlaceholder")}
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0"
                autoComplete="username"
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("login.usernameOrEmailHelp")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("login.password")}</Label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <FiLock className="text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("login.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            size={isMobile ? "default" : "lg"}
            disabled={loading}
          >
            <FiLogIn className="h-4 w-4" />
            {t("login.loginButton")}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t("login.noAccount")}{" "}
          <Link to="/register" className="font-semibold text-primary">
            {t("login.registerNow")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
