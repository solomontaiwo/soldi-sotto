import React, { useState, useEffect, useMemo } from "react";
import { useUnifiedTransactions } from "../../context/UnifiedTransactionProvider.jsx";
import { useAuth } from "../../context/AuthProvider.jsx";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import formatCurrency from "../../utils/formatCurrency.jsx";
import { useCategories } from "../../utils/categories.jsx";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select } from "../ui/select";
import { Badge } from "../ui/badge";
import { FiBarChart, FiTrendingUp, FiTrendingDown, FiActivity, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { generatePeriodPDFReport } from "../../utils/pdfUtils.jsx";
import { generateExportFileName } from "../../utils/downloadUtils.jsx"; // Using unified filename generator
import { useDateRange } from "../../hooks/useDateRange.jsx";
import { calculateStats } from "../../utils/statsUtils.jsx";

const TransactionAnalytics = () => {
  const { isDemo, transactions: recentTransactions, maxTransactions, loading: contextLoading, fetchAllTransactions } = useUnifiedTransactions();
  const { currentUser } = useAuth();
  const { expenseCategories, incomeCategories } = useCategories();
  const { t, i18n } = useTranslation();

  // Use custom hook for date range management
  const { period, setPeriod, customRange, setCustomRange, startDate, endDate } = useDateRange(
    localStorage.getItem("analytics-period") ? JSON.parse(localStorage.getItem("analytics-period")).period : "month",
    localStorage.getItem("analytics-period") ? JSON.parse(localStorage.getItem("analytics-period")).customRange : null
  );

  const [analyticsData, setAnalyticsData] = useState([]);
  const [isLoadingAnalyticsData, setIsLoadingAnalyticsData] = useState(true);

  // Fetch full transaction history for analytics when component mounts or dependencies change
  useEffect(() => {
    const loadData = async () => {
      if (isDemo) {
        setAnalyticsData(recentTransactions);
        setIsLoadingAnalyticsData(false);
      } else if (currentUser) {
        setIsLoadingAnalyticsData(true);
        // Stale-while-revalidate: immediate cached data, then background refresh
        const data = await fetchAllTransactions({ onRevalidated: setAnalyticsData });
        setAnalyticsData(data);
        setIsLoadingAnalyticsData(false);
      } else {
        // Not demo and not logged in
        setAnalyticsData([]);
        setIsLoadingAnalyticsData(false);
      }
    };
    loadData();
  }, [isDemo, recentTransactions, currentUser, fetchAllTransactions]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem(
      "analytics-period",
      JSON.stringify({
        period,
        customRange,
      })
    );
  }, [period, customRange]);

  const stats = useMemo(() => {
    return calculateStats(analyticsData, startDate, endDate);
  }, [analyticsData, startDate, endDate]);

  // Extended stats logic specific to this view (Categories with percentages, Monthly Trend)
  const extendedStats = useMemo(() => {
    if (!analyticsData.length) return {};

    // 1. Categories with percentages
    const processCategories = (categoryMap, totalAmount, categoryList) => {
      return Object.entries(categoryMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => {
          const categoryData = categoryList.find((c) => c.value === category);
          const rawLabel = categoryData?.label || t(`categories.${category}`, { defaultValue: category });
          return {
            category,
            amount,
            percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
            label: rawLabel.replace(/^[^\p{L}\p{N}]+/u, "").trim(),
          };
        });
    };
    
    const filteredTransactions = analyticsData.filter((transaction) => {
       return transaction.date && isWithinInterval(transaction.date, { start: startDate, end: endDate });
    });

    const expenseByCategory = {};
    const incomeByCategory = {};

    filteredTransactions.forEach((t) => {
      if (t.type === "expense") {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      } else {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      }
    });

    const topExpenseCategories = processCategories(expenseByCategory, stats.totalExpense, expenseCategories);
    const topIncomeCategories = processCategories(incomeByCategory, stats.totalIncome, incomeCategories);

    // 2. Monthly Trend (Last 6 months)
    const now = new Date();
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const monthTransactions = analyticsData.filter((t) => 
        t.date && isWithinInterval(t.date, { start: monthStart, end: monthEnd })
      );
      
      const monthIncome = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const monthExpense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
      
      monthlyTrend.push({
        month: format(monthStart, "MMM yyyy"),
        income: monthIncome,
        expense: monthExpense,
        balance: monthIncome - monthExpense,
      });
    }

    // 3. Averages
    const avgTransactionAmount = filteredTransactions.length > 0
        ? filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length
        : 0;
    
    // Savings Rate
    const savingsRate = stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100 : 0;

    return {
      topExpenseCategories,
      topIncomeCategories,
      monthlyTrend,
      avgTransactionAmount,
      savingsRate,
      filteredTransactions // Needed for export
    };
  }, [analyticsData, startDate, endDate, stats, expenseCategories, incomeCategories, t]);


  const exportCsv = () => {
    if (!extendedStats?.filteredTransactions?.length) return;
    const headers = ["Data", "Tipo", "Descrizione", "Categoria", "Importo"];
    const rows = extendedStats.filteredTransactions.map((t) => {
      return [
        format(t.date, "yyyy-MM-dd"),
        t.type,
        `"${(t.description || "").replace(/"/g, '""')}"`, // Corrected escaping for description
        t.category || "",
        t.amount,
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = generateExportFileName(period, startDate, endDate, currentUser, "csv");
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    if (!extendedStats?.filteredTransactions?.length || !startDate || !endDate) return;
    await generatePeriodPDFReport(
      extendedStats.filteredTransactions,
      startDate,
      endDate,
      period === "custom"
        ? `${t("analytics.custom")} (${customRange.from} - ${customRange.to})`
        : period,
      i18n.language,
      currentUser // Pass current user for filename generation
    );
  };

  if (contextLoading || isLoadingAnalyticsData) { // Use local loading state
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
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="md:w-48 h-11 self-center">
              <option value="month">{t("analytics.thisMonth")}</option>
              <option value="lastMonth">{t("analytics.lastMonth")}</option>
              <option value="last3Months">{t("analytics.last3Months")}</option>
              <option value="year">{t("analytics.thisYear")}</option>
              <option value="custom">{t("analytics.custom")}</option>
            </Select>
            {period === "custom" && (
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
              <Button variant="outline" onClick={exportCsv} disabled={!extendedStats?.filteredTransactions?.length}>
                {t("analytics.exportCsv")}
              </Button>
              <Button variant="outline" onClick={exportPdf} disabled={!extendedStats?.filteredTransactions?.length}>
                {t("analytics.exportPdf")}
              </Button>
            </div>
          </div>
        </div>
        {isDemo && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary flex items-center gap-2">
            <Badge variant="secondary">{recentTransactions.filter(t => !t.isSample).length}/{maxTransactions}</Badge>
            <span>{t("analytics.demoDescription", { current: recentTransactions.filter(t => !t.isSample).length, max: maxTransactions })}
          </span></div>
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
          </CardHeader>
          <CardContent className="space-y-3">
            {extendedStats.topExpenseCategories?.length ? (
              extendedStats.topExpenseCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
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
          </CardHeader>
          <CardContent className="space-y-3">
            {extendedStats.topIncomeCategories?.length ? (
              extendedStats.topIncomeCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
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
          {extendedStats.monthlyTrend?.length ? (
            extendedStats.monthlyTrend.map((month, idx) => (
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
            <p className="text-2xl font-semibold text-primary">{formatCurrency(stats.dailyAverageExpense || 0)}</p>
            <p className="text-xs text-muted-foreground">{t("analytics.inSelectedPeriod")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.avgTransaction")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">{formatCurrency(extendedStats.avgTransactionAmount || 0)}</p>
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
