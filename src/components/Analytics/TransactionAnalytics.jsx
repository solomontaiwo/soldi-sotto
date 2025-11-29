import { useState, useEffect, useMemo } from "react";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, subMonths } from "date-fns";
import formatCurrency from "../../utils/formatCurrency";
import { useCategories } from "../../utils/categories";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Select } from "../ui/select";
import { Badge } from "../ui/badge";
import { FiBarChart, FiTrendingUp, FiTrendingDown, FiActivity, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { generatePeriodPDFReport } from "../../utils/pdfUtils";

const TransactionAnalytics = () => {
  const { isDemo, transactions, maxTransactions, loading } = useUnifiedTransactions();
  const { expenseCategories, incomeCategories } = useCategories();
  const periodPref = useMemo(() => {
    const saved = localStorage.getItem("analytics-period");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { period: "month" };
      }
    }
    return { period: "month" };
  }, []);

  const [selectedPeriod, setSelectedPeriod] = useState(periodPref.period || "month");
  const [customRange, setCustomRange] = useState(periodPref.customRange || { from: "", to: "" });
  const [stats, setStats] = useState({});
  const { t, i18n } = useTranslation();

  const calculateAdvancedStats = useMemo(() => {
    if (!transactions.length) return {};
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case "thisMonth":
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "lastMonth": {
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      }
      case "thisYear":
      case "year":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case "last3Months":
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case "custom":
        if (customRange?.from && customRange?.to) {
          startDate = new Date(customRange.from);
          endDate = new Date(customRange.to);
        } else {
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
        }
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = transaction.date.toDate ? transaction.date.toDate() : new Date(transaction.date);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate });
    });

    const totalIncome = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    const expenseByCategory = {};
    const incomeByCategory = {};

    filteredTransactions.forEach((t) => {
      if (t.type === "expense") {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      } else {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      }
    });

    const translateCategory = (category) => t(`categories.${category}`, { defaultValue: category });
    const cleanLabel = (label, category) => {
      const translated = translateCategory(category);
      return translated.replace(/^[^\p{L}\p{N}]+/u, "").trim();
    };

    const topExpenseCategories = Object.entries(expenseByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => {
        const categoryData = expenseCategories.find((c) => c.value === category);
        return {
          category,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
          label: cleanLabel(categoryData?.label || category, category),
          emoji: categoryData ? categoryData.label.split(" ")[0] : "💸",
        };
      });

    const topIncomeCategories = Object.entries(incomeByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => {
        const categoryData = incomeCategories.find((c) => c.value === category);
        return {
          category,
          amount,
          percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
          label: cleanLabel(categoryData?.label || category, category),
          emoji: categoryData ? categoryData.label.split(" ")[0] : "💰",
        };
      });

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const monthTransactions = transactions.filter((t) => {
        const transactionDate = t.date.toDate ? t.date.toDate() : new Date(t.date);
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
      });
      const monthIncome = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const monthExpense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
      monthlyTrend.push({
        month: format(monthStart, "MMM yyyy"),
        income: monthIncome,
        expense: monthExpense,
        balance: monthIncome - monthExpense,
      });
    }

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const avgDailyExpense = totalExpense / Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
    const avgTransactionAmount =
      filteredTransactions.length > 0
        ? filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length
        : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      avgDailyExpense,
      avgTransactionAmount,
      topExpenseCategories,
      topIncomeCategories,
      monthlyTrend,
      transactionCount: filteredTransactions.length,
      periodLabel: selectedPeriod,
      startDate,
      endDate,
      filteredTransactions,
    };
  }, [transactions, selectedPeriod, customRange, expenseCategories, incomeCategories, t]);

  useEffect(() => {
    setStats(calculateAdvancedStats);
  }, [calculateAdvancedStats]);

  useEffect(() => {
    localStorage.setItem(
      "analytics-period",
      JSON.stringify({
        period: selectedPeriod,
        customRange,
      })
    );
  }, [selectedPeriod, customRange]);

  const exportCsv = () => {
    if (!stats?.filteredTransactions?.length) return;
    const headers = ["Data", "Tipo", "Descrizione", "Categoria", "Importo"];
    const rows = stats.filteredTransactions.map((t) => {
      const date = t.date.toDate ? t.date.toDate() : new Date(t.date);
      return [
        format(date, "yyyy-MM-dd"),
        t.type,
        `"${(t.description || "").replace(/"/g, '""')}"`,
        t.category || "",
        t.amount,
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `analytics-${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    if (!stats?.filteredTransactions?.length || !stats.startDate || !stats.endDate) return;
    await generatePeriodPDFReport(
      stats.filteredTransactions,
      stats.startDate,
      stats.endDate,
      selectedPeriod === "custom"
        ? `${t("analytics.custom")} (${customRange.from} - ${customRange.to})`
        : selectedPeriod,
      i18n.language
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton height={48} />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={120} borderRadius={18} />
          ))}
        </div>
        <Skeleton height={220} borderRadius={18} />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <FiBarChart className="text-primary" /> {t("analytics.title")}
            </h2>
            <p className="text-muted-foreground">{t("analytics.subtitle")}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 md:flex-wrap">
            <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="md:w-48 h-11 self-center">
              <option value="month">{t("analytics.thisMonth")}</option>
              <option value="lastMonth">{t("analytics.lastMonth")}</option>
              <option value="last3Months">{t("analytics.last3Months")}</option>
              <option value="year">{t("analytics.thisYear")}</option>
              <option value="custom">{t("analytics.custom")}</option>
            </Select>
            {selectedPeriod === "custom" && (
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:items-center md:pl-1">
                <label className="text-muted-foreground text-xs md:text-sm leading-none">{t("analytics.from")}</label>
                <input
                  type="date"
                  value={customRange.from}
                  onChange={(e) => setCustomRange((r) => ({ ...r, from: e.target.value }))}
                  className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background md:min-w-[170px]"
                />
                <label className="text-muted-foreground text-xs md:text-sm leading-none">{t("analytics.to")}</label>
                <input
                  type="date"
                  value={customRange.to}
                  onChange={(e) => setCustomRange((r) => ({ ...r, to: e.target.value }))}
                  className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background md:min-w-[170px]"
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={exportCsv} disabled={!stats?.filteredTransactions?.length}>
                {t("analytics.exportCsv")}
              </Button>
              <Button variant="outline" onClick={exportPdf} disabled={!stats?.filteredTransactions?.length}>
                {t("analytics.exportPdf")}
              </Button>
            </div>
          </div>
        </div>
        {isDemo && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary flex items-center gap-2">
            <Badge variant="secondary">{transactions.length}/{maxTransactions}</Badge>
            <span>{t("analytics.demoDescription", { current: transactions.length, max: maxTransactions })}</span>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: t("analytics.totalIncome"), value: stats.totalIncome, icon: <FiTrendingUp />, color: "text-emerald-600" },
            { title: t("analytics.totalExpense"), value: stats.totalExpense, icon: <FiTrendingDown />, color: "text-rose-600" },
            { title: t("analytics.balance"), value: stats.balance, icon: <FiBarChart />, color: "text-primary" },
            { title: t("analytics.totalTransactions"), value: stats.transactionCount, icon: <FiActivity />, color: "text-muted-foreground" },
          ].map((item, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className={`text-lg ${item.color}`}>{item.icon}</span>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {typeof item.value === "number" && idx !== 3 ? formatCurrency(item.value) : item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.topExpenseCategories")}</CardTitle>
            <CardDescription>{t("analytics.ofTotal")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.topExpenseCategories?.length ? (
              stats.topExpenseCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span className="font-semibold">{cat.label}</span>
                    </div>
                    <span className="text-rose-600 font-semibold">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-rose-500" style={{ width: `${cat.percentage.toFixed(1)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("analytics.noExpenseData")}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.topIncomeCategories")}</CardTitle>
            <CardDescription>{t("analytics.ofTotal")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.topIncomeCategories?.length ? (
              stats.topIncomeCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span className="font-semibold">{cat.label}</span>
                    </div>
                    <span className="text-emerald-600 font-semibold">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${cat.percentage.toFixed(1)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("analytics.noIncomeData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.monthlyTrend")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {stats.monthlyTrend?.length ? (
            stats.monthlyTrend.map((month, idx) => (
              <div
                key={idx}
                className={`rounded-xl border border-border p-3 ${
                  month.balance >= 0 ? "bg-emerald-500/5" : "bg-rose-500/5"
                }`}
              >
                <p className="text-sm font-semibold">{month.month}</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <FiArrowUp /> {formatCurrency(month.income)}
                </div>
                <div className="flex items-center gap-1 text-xs text-rose-600">
                  <FiArrowDown /> {formatCurrency(month.expense)}
                </div>
                <p className={`text-sm font-semibold ${month.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {formatCurrency(month.balance)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t("analytics.insufficientData")}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.avgDailyExpense")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">{formatCurrency(stats.avgDailyExpense || 0)}</p>
            <p className="text-xs text-muted-foreground">{t("analytics.inSelectedPeriod")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.avgTransaction")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">{formatCurrency(stats.avgTransactionAmount || 0)}</p>
            <p className="text-xs text-muted-foreground">{t("analytics.avgTransactionDescription")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.totalTransactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">{stats.transactionCount || 0}</p>
            <p className="text-xs text-muted-foreground">{t("analytics.inSelectedPeriod")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(TransactionAnalytics);
