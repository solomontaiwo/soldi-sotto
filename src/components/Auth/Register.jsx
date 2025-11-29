import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../utils/firebase";
import { useNotification } from "../../utils/notificationUtils";
import { motion } from "framer-motion";
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiUserPlus } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

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

    if (username.length < 3) {
      setError(t("profile.usernameMinLength"));
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError(t("errors.weakPassword"));
      setLoading(false);
      return;
    }

    try {
      const usernameLower = username.trim().toLowerCase();
      const usernameDoc = await getDoc(doc(firestore, "usernames", usernameLower));
      if (usernameDoc.exists()) {
        setError(t("errors.usernameTaken"));
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      await setDoc(doc(firestore, "users", user.uid), {
        username: usernameLower,
        email: email.toLowerCase(),
        displayName: username,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await setDoc(doc(firestore, "usernames", usernameLower), {
        uid: user.uid,
        createdAt: new Date(),
      });

      notification.success(t("errors.accountCreatedSuccess"));
      navigate("/dashboard");
    } catch (err) {
      console.error("Errore durante la registrazione:", err);
      let errorMessage = t("errors.registrationError");
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = t("errors.emailAlreadyInUse");
          break;
        case "auth/invalid-email":
          errorMessage = t("errors.invalidEmail");
          break;
        case "auth/weak-password":
          errorMessage = t("errors.weakPassword");
          break;
        case "auth/operation-not-allowed":
          errorMessage = t("errors.operationNotAllowed");
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
          {t("register.backToHome")}
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 text-2xl">
            🚀
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{t("register.title")}</h2>
            <p className="text-muted-foreground text-sm">{t("register.subtitle")}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t("profile.username")}</Label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <FiUser className="text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="solomon"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <FiMail className="text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("login.password")}</Label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <FiLock className="text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">{t("register.confirmPassword")}</Label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <FiLock className="text-muted-foreground" />
              <Input
                id="confirm"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-muted-foreground">
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            size={isMobile ? "default" : "lg"}
            disabled={loading}
          >
            <FiUserPlus className="h-4 w-4" />
            {t("register.registerButton")}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t("register.haveAccount")}{" "}
          <Link to="/login" className="font-semibold text-primary">
            {t("register.loginNow")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
