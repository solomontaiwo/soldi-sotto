import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import TransactionModal from "../Transaction/TransactionModal";
import React from "react";
import { useTranslation } from "react-i18next";
import { FiBarChart2, FiList, FiPlus, FiPieChart } from "react-icons/fi";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import RecentTransactions from "./RecentTransactions";
import formatCurrency from "../../utils/formatCurrency";
import { calculateStats, getPeriodRange } from "../../utils/statsUtils";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    transactions,
    isDemo,
    canAddMoreTransactions,
    loading: transactionsLoading,
  } = useUnifiedTransactions();

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { t } = useTranslation();

  const periodPref = useMemo(() => {
    const saved = localStorage.getItem("analytics-period");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { period: "monthly" };
      }
    }
    return { period: "monthly" };
  }, []);

  const { start: periodStart, end: periodEnd } = getPeriodRange(periodPref.period || "monthly", periodPref.customRange);
  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const date = t.date?.toDate ? t.date.toDate() : new Date(t.date);
        return date >= periodStart && date <= periodEnd;
      }),
    [transactions, periodStart, periodEnd]
  );

  const stats = filtered.length ? calculateStats(filtered, periodStart, periodEnd) : { totalIncome: 0, totalExpense: 0, balance: 0 };

  const quickActions = useMemo(
    () => [
      {
        key: "add-transaction",
        title: t("addTransaction"),
        subtitle: t("whatToRegister"),
        icon: <FiPlus />,
        action: () => setShowQuickAdd(true),
        disabled: isDemo && !canAddMoreTransactions,
      },
      {
        key: "view-transactions",
        title: t("manageAll"),
        subtitle: t("yourTransactions"),
        icon: <FiList />,
        action: () => navigate("/transactions"),
      },
      {
        key: "view-analytics",
        title: t("navbar.analytics"),
        subtitle: t("landing.mainFeatures"),
        icon: <FiBarChart2 />,
        action: () => navigate("/analytics"),
      },
    ],
    [isDemo, canAddMoreTransactions, navigate, t]
  );

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-2xl border border-border bg-card/70 p-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Soldi Sotto</p>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            {currentUser ? "👋" : "👋"} {t("welcome")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">{t("motivationalQuote")}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Button variant="outline" size="lg" onClick={() => navigate("/analytics")} className="gap-2 px-4">
            <FiPieChart className="h-4 w-4" />
            {t("navbar.analytics")}
          </Button>
          <Button size="lg" onClick={() => setShowQuickAdd(true)} disabled={isDemo && !canAddMoreTransactions} className="gap-2 px-4">
            <FiPlus className="h-4 w-4" /> {t("addTransaction")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass">
          <CardHeader>
            <CardTitle>{t("financialOverview.balance")}</CardTitle>
            <CardDescription>{t("financialOverview.totalTransactions")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(stats.balance || 0)}</p>
            <p className="text-sm text-muted-foreground">
              {t("financialOverview.totalIncome")}: {formatCurrency(stats.totalIncome || 0)}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("financialOverview.totalExpense")}: {formatCurrency(stats.totalExpense || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader>
            <CardTitle>{t("financialOverview.totalIncome")}</CardTitle>
            <CardDescription>{periodPref.period}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalIncome || 0)}</p>
            <p className="text-sm text-muted-foreground">{t("recentTransactions.title")}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader>
            <CardTitle>{t("financialOverview.totalExpense")}</CardTitle>
            <CardDescription>{periodPref.period}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-rose-600">{formatCurrency(stats.totalExpense || 0)}</p>
            <p className="text-sm text-muted-foreground">{t("recentTransactions.title")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 glass">
          <CardHeader>
            <CardTitle>{t("quickActions")}</CardTitle>
            <CardDescription>{t("whatToRegister")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {quickActions.map((action) => (
              <button
                key={action.key}
                onClick={() => !action.disabled && action.action()}
                className={`flex items-center gap-3 rounded-xl border border-border bg-card/80 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  action.disabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {action.icon}
                </span>
                <div>
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.subtitle}</div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>{t("recentTransactions.title")}</CardTitle>
            <CardDescription>{t("recentTransactions.viewAll")}</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={transactions} loading={transactionsLoading} />
          </CardContent>
        </Card>
      </div>

      <TransactionModal show={showQuickAdd} onClose={() => setShowQuickAdd(false)} transaction={null} />
    </div>
  );
};

export default React.memo(Dashboard);
