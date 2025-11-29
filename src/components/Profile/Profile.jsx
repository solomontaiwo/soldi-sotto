import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useTheme } from "../../utils/ThemeProvider";
import { useNotification } from "../../utils/notificationUtils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { firestore } from "../../utils/firebase";
import formatCurrency from "../../utils/formatCurrency";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";

const Profile = () => {
  const { currentUser, loading: userLoading, logout } = useAuth();
  const { transactions, getStats, loading: transactionsLoading } = useUnifiedTransactions();
  const loading = userLoading || transactionsLoading;
  const { theme, toggleTheme } = useTheme();
  const notification = useNotification();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({});
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
      notification.error(t("profile.usernameMinLength"));
      return;
    }
    if (newUsername.toLowerCase() === currentUsername.toLowerCase()) {
      notification.info(t("profile.usernameSame"));
      return;
    }
    const confirmed = window.confirm(t("profile.usernameConfirm", { currentUsername, newUsername }));
    if (!confirmed) return;

    setUsernameLoading(true);
    try {
      const isAvailable = await checkUsernameAvailability(newUsername);
      if (!isAvailable) {
        notification.error(t("profile.usernameUnavailable"));
        return;
      }

      await setDoc(doc(firestore, "usernames", newUsername.toLowerCase()), {
        uid: currentUser.uid,
        createdAt: new Date(),
      });

      await setDoc(
        doc(firestore, "users", currentUser.uid),
        {
          username: newUsername.toLowerCase(),
          displayName: newUsername,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      await updateProfile(currentUser, {
        displayName: newUsername,
      });

      if (currentUsername && currentUsername.toLowerCase() !== newUsername.toLowerCase()) {
        try {
          await deleteDoc(doc(firestore, "usernames", currentUsername.toLowerCase()));
        } catch (deleteError) {
          console.warn("Errore nella rimozione del vecchio username (non critico):", deleteError);
        }
      }

      setCurrentUsername(newUsername);
      setNewUsername("");
      notification.success(t("profile.usernameSuccess"));
    } catch (error) {
      console.error("Errore nell'aggiornamento username:", error);
      let errorMessage = t("profile.usernameError");
      if (error.code === "permission-denied") {
        errorMessage = t("profile.usernamePermissionError");
      } else if (error.code === "network-request-failed") {
        errorMessage = t("profile.usernameNetworkError");
      }
      notification.error(errorMessage);
    } finally {
      setUsernameLoading(false);
    }
  };

  const registrationDate = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString("it-IT")
    : t("profile.dateNotAvailable");

  const profileStats = useMemo(
    () => [
      {
        title: t("profile.totalTransactions"),
        value: transactions.length,
      },
      {
        title: t("profile.currentBalance"),
        value: formatCurrency(userStats.balance || 0),
      },
      {
        title: t("profile.daysActive"),
        value: currentUser?.metadata?.creationTime
          ? Math.floor((Date.now() - new Date(currentUser.metadata.creationTime)) / (1000 * 60 * 60 * 24))
          : 0,
        suffix: ` ${t("profile.days")}`,
      },
    ],
    [transactions.length, userStats.balance, currentUser?.metadata?.creationTime, t]
  );

  const themeOptions = [
    { value: "light", label: t("profile.themeLight") },
    { value: "dark", label: t("profile.themeDark") },
    { value: "system", label: t("profile.themeSystem") },
  ];

  const languageOptions = [
    { value: "it", label: "Italiano" },
    { value: "en", label: "English" },
  ];

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem("appLanguage", e.target.value);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-16 rounded-xl border border-border bg-muted animate-pulse" />
        <div className="grid gap-3 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-xl">
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <CardTitle className="text-2xl">{currentUsername || currentUser?.email}</CardTitle>
                <CardDescription>
                  {t("profile.registeredOn")}: {registrationDate}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              {t("navbar.logout")}
            </Button>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {profileStats.map((stat, idx) => (
          <Card key={idx} className="glass">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
              <CardDescription className="text-2xl font-semibold text-foreground">
                {stat.value}
                {stat.suffix}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.editUsername")}</CardTitle>
            <CardDescription>{t("profile.usernameHelp")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>{t("profile.currentUsername")}</Label>
            <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
              {currentUsername || "—"}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newUsername">{t("profile.newUsername")}</Label>
              <Input
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="nuovo-username"
              />
            </div>
            <Button onClick={handleUsernameChange} disabled={usernameLoading}>
              {usernameLoading ? t("profile.updating") : t("save")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.settingsTitle")}</CardTitle>
            <CardDescription>{t("profile.accountInfo")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>{t("profile.theme")}</Label>
              <select
                value={theme}
                onChange={(e) => toggleTheme(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                {themeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("profile.language")}</Label>
              <select
                value={i18n.language}
                onChange={handleLanguageChange}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(Profile);
