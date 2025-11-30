import { useState, useEffect, useMemo } from "react";
import React from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthProvider.jsx";
import { useUnifiedTransactions } from "../../context/UnifiedTransactionProvider.jsx";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
  isAfter,
  isBefore,
  differenceInDays,
  isEqual,
} from "date-fns";
import { calculateStats } from "../../utils/statsUtils";
import { generatePDF } from "../../utils/pdfUtils";
import LoadingWrapper from "../../utils/loadingWrapper";
import formatCurrency from "../../utils/formatCurrency";
import logo from "/icon.png";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const StatPill = ({ label, value, tone }) => {
  const backgrounds = {
    emerald: "bg-emerald-500/10",
    rose: "bg-rose-500/10",
    primary: "bg-primary/10",
    secondary: "bg-muted",
  };
  return (
    <div className={`rounded-xl border border-border p-4 ${backgrounds[tone] || "bg-muted"}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
};

StatPill.propTypes = {
  label: PropTypes.node,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
  tone: PropTypes.oneOf(["emerald", "rose", "primary", "secondary"]),
};

StatPill.defaultProps = {
  label: "",
  value: "",
  tone: "secondary",
};

const ProgressBar = ({ value, color = "emerald" }) => {
  const colors = {
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    primary: "bg-primary",
  };
  return (
    <div className="w-full h-3 rounded-full bg-muted">
      <div
        className={`h-3 rounded-full ${colors[color] || colors.primary}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number,
  color: PropTypes.oneOf(["emerald", "rose", "primary"]),
};

ProgressBar.defaultProps = {
  value: 0,
  color: "emerald",
};

const Stats = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { transactions, loading: transactionsLoading, isDemo, startDemo } = useUnifiedTransactions();
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState("monthly");
  const [customRange, setCustomRange] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const loading = authLoading || transactionsLoading;

  const getSafeDate = (dateInput) => {
    if (!dateInput) return null;
    if (dateInput.toDate) return dateInput.toDate();
    if (dateInput.seconds) return new Date(dateInput.seconds * 1000);
    const parsed = new Date(dateInput);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  useEffect(() => {
    if (!loading && transactions.length > 0) {
      const today = new Date();
      let start, end;

      if (viewMode === "custom" && customRange) {
        [start, end] = customRange;
      } else {
        switch (viewMode) {
          case "daily":
            start = startOfDay(today);
            end = endOfDay(today);
            break;
          case "weekly":
            start = startOfWeek(today, { weekStartsOn: 1 });
            end = endOfWeek(today, { weekStartsOn: 1 });
            break;
          case "annually":
            start = startOfYear(today);
            end = endOfYear(today);
            break;
          case "monthly":
          default:
            start = startOfMonth(today);
            end = endOfMonth(today);
            break;
        }
      }

      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = getSafeDate(transaction.date);
        if (!transactionDate) return false;
        return (
          (isAfter(transactionDate, start) || isEqual(transactionDate, start)) &&
          (isBefore(transactionDate, end) || isEqual(transactionDate, end))
        );
      });

      setStats(calculateStats(filteredTransactions, start, end));
      setStartDate(start);
      setEndDate(end);
    } else if (!loading && transactions.length === 0) {
      setStats(null);
      setStartDate(null);
      setEndDate(null);
    }
  }, [loading, transactions, viewMode, customRange]);

  const handleViewModeChange = (value) => {
    setViewMode(value);
    if (value !== "custom") setCustomRange(null);
  };

  const daysCount = useMemo(
    () => (startDate && endDate ? differenceInDays(endOfDay(endDate), startOfDay(startDate)) + 1 : 0),
    [startDate, endDate]
  );
  const avgDailyIncome = useMemo(() => (stats && daysCount ? stats.totalIncome / daysCount : 0), [stats, daysCount]);
  const avgDailyExpense = useMemo(() => (stats && daysCount ? stats.totalExpense / daysCount : 0), [stats, daysCount]);
  const savingPercentage = useMemo(
    () => (stats && stats.totalIncome ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100 : 0),
    [stats]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton height={48} borderRadius={12} />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={120} borderRadius={18} />
          ))}
        </div>
        <Skeleton height={200} borderRadius={18} />
      </div>
    );
  }

  if (!currentUser && !isDemo) {
    return (
      <div className="container py-5">
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>{t("statsPage.loginTitle")}</CardTitle>
            <CardDescription>{t("statsPage.loginSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 md:flex-row md:justify-center">
            <Button onClick={() => navigate("/login")}>{t("navLogin")}</Button>
            <Button variant="outline" onClick={() => navigate("/register")}>
              {t("navRegister")}
            </Button>
            <Button variant="secondary" onClick={() => { startDemo(); navigate("/transactions"); }}>
              {t("statsPage.tryDemo")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const incomeShare = stats ? (stats.totalIncome ? (stats.totalIncome / Math.max(1, stats.totalIncome + stats.totalExpense)) * 100 : 0) : 0;
  const hasData = stats && stats.transactionCount > 0;

  return (
    <LoadingWrapper loading={loading}>
      <div className="page-shell">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">{t("statsPage.title")}</h2>
            <p className="text-muted-foreground">{t("statsPage.subtitle")}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <Select value={viewMode} onChange={(e) => handleViewModeChange(e.target.value)} className="md:w-48">
              <option value="daily">Oggi</option>
              <option value="weekly">Settimana</option>
              <option value="monthly">Mese</option>
              <option value="annually">Anno</option>
            </Select>
            {currentUser ? (
              <Button
                onClick={() =>
                  generatePDF(
                    currentUser,
                    transactions,
                    stats,
                    viewMode,
                    logo,
                    "https://solomontaiwo.github.io/soldi-sotto/",
                    "https://www.instagram.com/solomon.taiwo/",
                    startDate,
                    endDate,
                    i18n.language
                  )
                }
                disabled={!stats}
              >
                {t("statsPage.downloadPdf")}
              </Button>
            ) : (
              <Button variant="outline" disabled>
                {t("statsPage.pdfLoginNotice")}
              </Button>
            )}
          </div>
        </div>

        {hasData ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatPill label={t("financialOverview.totalIncome")} value={formatCurrency(stats.totalIncome)} tone="emerald" />
              <StatPill label={t("financialOverview.totalExpense")} value={formatCurrency(stats.totalExpense)} tone="rose" />
              <StatPill label={t("financialOverview.balance")} value={formatCurrency(stats.balance)} tone="primary" />
              <StatPill label={t("statsPage.transactions")} value={stats.transactionCount} tone="secondary" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("statsPage.incomeVsExpense")}</CardTitle>
                  <CardDescription>{stats.transactionCount} {t("statsPage.movements")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ProgressBar value={incomeShare} color="emerald" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600">{formatCurrency(stats.totalIncome)}</span>
                    <span className="text-rose-600">-{formatCurrency(stats.totalExpense)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("statsPage.savingsRate")}</CardTitle>
                  <CardDescription>{t("statsPage.period")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ProgressBar value={savingPercentage} color={stats.balance >= 0 ? "emerald" : "rose"} />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{formatCurrency(stats.balance)}</span>
                    <span className={stats.balance >= 0 ? "text-emerald-600" : "text-rose-600"}>
                      {savingPercentage.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("statsPage.dailyAverages")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("statsPage.avgIncome")}</span>
                    <span className="text-emerald-600 font-semibold">{formatCurrency(avgDailyIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("statsPage.avgExpense")}</span>
                    <span className="text-rose-600 font-semibold">{formatCurrency(avgDailyExpense)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("statsPage.categoryBreakdown")}</CardTitle>
                  <CardDescription>{t("statsPage.ofExpenses")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stats.categoryBreakdown &&
                    Object.entries(stats.categoryBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => {
                        const percentage = stats.totalExpense > 0 ? (amount / stats.totalExpense) * 100 : 0;
                        return (
                          <div key={category} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="capitalize">{category}</span>
                              <span className="font-semibold text-rose-600">{formatCurrency(amount)}</span>
                            </div>
                            <ProgressBar value={percentage} color="rose" />
                          </div>
                        );
                      })}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="text-center p-8">
            <div className="text-4xl mb-3">📊</div>
            <CardTitle>{t("statsPage.emptyTitle")}</CardTitle>
            <CardDescription>{t("statsPage.emptySubtitle")}</CardDescription>
            <div className="mt-4">
              <Button onClick={() => navigate("/transactions")}>{t("addTransaction")}</Button>
            </div>
          </Card>
        )}
      </div>
    </LoadingWrapper>
  );
};

export default React.memo(Stats);
