import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiBarChart2, FiFileText, FiPlay, FiShield, FiStar, FiUserPlus, FiZap } from "react-icons/fi";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const featureCards = [
  { icon: <FiBarChart2 className="h-5 w-5" />, titleKey: "analytics.title", descKey: "landing.features.analyticsDesc" },
  { icon: <FiFileText className="h-5 w-5" />, titleKey: "transactionModal.newTitle", descKey: "landing.features.pdfDesc" },
  { icon: <FiShield className="h-5 w-5" />, titleKey: "landing.features.securityTitle", descKey: "landing.features.securityDesc" },
];

const LandingPage = () => {
  const { currentUser } = useAuth();
  const { isDemo, startDemo } = useUnifiedTransactions();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [startingDemo, setStartingDemo] = useState(false);
  const { t } = useTranslation();

  const handleStartDemo = async () => {
    setStartingDemo(true);
    if (!isDemo && !currentUser) startDemo();
    setTimeout(() => {
      navigate("/transactions");
      setStartingDemo(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="relative overflow-hidden flex-1 flex flex-col justify-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-[-200px] h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-1/3 bottom-[-200px] h-[380px] w-[380px] rounded-full bg-emerald-400/20 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row lg:items-center lg:gap-12 lg:py-6">
          <div className="flex-1 space-y-4 lg:space-y-5">
            <Badge variant="secondary" className="inline-flex items-center gap-2 rounded-full px-3 py-1">
              <FiZap className="h-4 w-4" />
              {t("appName")}
            </Badge>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl font-bold leading-tight sm:text-5xl lg:text-5xl"
            >
              {t("landing.heroSubtitle")}
            </motion.h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              {t("landing.heroBody")}
            </p>
            <div className={`flex flex-wrap gap-3 ${isMobile ? "flex-col" : ""}`}>
              <Button size="lg" onClick={handleStartDemo} disabled={startingDemo} className="gap-2">
                {startingDemo ? "Avvio..." : <FiPlay className="h-5 w-5" />}
                {t("landing.tryDemo")}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/register")} className="gap-2">
                <FiUserPlus className="h-5 w-5" />
                {t("landing.register")}
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate("/login")} className="gap-2">
                <FiArrowUpRight className="h-5 w-5" />
                {t("landing.login")}
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground lg:hidden">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <FiStar />
                </div>
                <span>{t("landing.highlights.mobile")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <FiShield />
                </div>
                <span>{t("landing.highlights.security")}</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-1"
          >
            <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-xl backdrop-blur-xl lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("financialOverview.balance")}</p>
                  <p className="text-2xl font-semibold text-primary lg:text-xl">€ 4.820</p>
                </div>
                <Badge variant="success">+12.4%</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-3 lg:gap-2">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>{t("financialOverview.totalIncome")}</CardTitle>
                    <CardDescription className="text-emerald-600">€ 6.200</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>{t("financialOverview.totalExpense")}</CardTitle>
                    <CardDescription className="text-rose-600">€ 1.380</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-8 lg:pb-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
            {featureCards.map((card, idx) => (
              <Card key={idx} className="glass h-full flex">
                <CardHeader className="flex-row items-start gap-3 lg:py-3 w-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight">
                      {card.title || t(card.titleKey)}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">{card.descKey ? t(card.descKey) : card.desc}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
