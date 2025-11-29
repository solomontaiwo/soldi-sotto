import { useState, useEffect, useCallback, useMemo } from "react";
import { useUnifiedTransactions } from "./UnifiedTransactionProvider";
import { useAuth } from "../Auth/AuthProvider";
import TransactionModal from "./TransactionModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  isToday,
  isYesterday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
} from "date-fns";
import { useMediaQuery } from "react-responsive";
import formatCurrency from "../../utils/formatCurrency";
import { FiPlus, FiTrash2, FiFilter, FiSearch, FiEdit2 } from "react-icons/fi";
import { useCategories } from "../../utils/categories";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/it";
import "dayjs/locale/en";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Badge } from "../ui/badge";

const TransactionList = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const {
    transactions,
    loading: transactionsLoading,
    deleteTransaction,
    isDemo,
    canAddMoreTransactions,
    maxTransactions,
  } = useUnifiedTransactions();

  const { expenseCategories, incomeCategories } = useCategories();

  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const { t, i18n } = useTranslation();

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const loading = authLoading || transactionsLoading;

  const motivationalQuotes = useMemo(() => t("dashboard.motivationalQuotes", { returnObjects: true }), [t]);
  const [quote, setQuote] = useState("");
  useEffect(() => {
    if (motivationalQuotes && motivationalQuotes.length > 0) {
      setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }
  }, [motivationalQuotes]);

  const formatGroupDate = (date) => {
    const lang = i18n.language || "it";
    if (isToday(date)) return t("transactions.today");
    if (isYesterday(date)) return t("transactions.yesterday");
    return dayjs(date).locale(lang).format(lang === "it" ? "DD MMMM YYYY" : "MMM DD, YYYY");
  };

  const getTransactionDate = (transaction) => {
    if (transaction.date?.toDate) {
      return transaction.date.toDate();
    } else if (transaction.date?.seconds) {
      return new Date(transaction.date.seconds * 1000);
    } else if (transaction.date instanceof Date) {
      return transaction.date;
    } else {
      return new Date(transaction.date);
    }
  };

  const groupTransactionsByDate = (transactions) => {
    const groups = {};
    transactions.forEach((transaction) => {
      const date = getTransactionDate(transaction);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date,
          displayDate: formatGroupDate(date),
          transactions: [],
        };
      }
      groups[dateKey].transactions.push(transaction);
    });
    return Object.values(groups).sort((a, b) => b.date - a.date);
  };

  const getCategoryEmoji = (category) => {
    const allCategories = [...expenseCategories, ...incomeCategories];
    const categoryData = allCategories.find((c) => c.value === category);
    return categoryData ? categoryData.label.split(" ")[0] : "💸";
  };

  const getCategoryLabel = (category) => {
    const allCategories = [...expenseCategories, ...incomeCategories];
    const categoryData = allCategories.find((c) => c.value === category);
    return categoryData ? categoryData.label : category;
  };

  useEffect(() => {
    const usableTransactions = transactions.filter((t) => !t.isSample);
    if (usableTransactions.length > 0) {
      const today = new Date();
      let startDate, endDate;

      switch (period) {
        case "weekly":
          startDate = startOfWeek(today, { weekStartsOn: 1 });
          endDate = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case "daily":
          startDate = startOfDay(today);
          endDate = endOfDay(today);
          break;
        case "annually":
          startDate = startOfYear(today);
          endDate = endOfYear(today);
          break;
        case "all":
          startDate = new Date(0);
          endDate = new Date();
          break;
        case "monthly":
        default:
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
      }

      let filtered = usableTransactions.filter((transaction) => {
        const transactionDate = getTransactionDate(transaction);
        const inDateRange = transactionDate >= startDate && transactionDate <= endDate;
        const matchesSearch =
          searchTerm === "" ||
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
        const matchesType = selectedType === "all" || transaction.type === selectedType;
        return inDateRange && matchesSearch && matchesCategory && matchesType;
      });

      filtered.sort((a, b) => getTransactionDate(b) - getTransactionDate(a));
      setFilteredTransactions(filtered);
    }
  }, [transactions, period, searchTerm, selectedCategory, selectedType]);

  const handleDeleteClick = useCallback(async (transactionId) => {
    setDeleteConfirm(transactionId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirm) {
      const success = await deleteTransaction(deleteConfirm);
      if (success) setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteTransaction]);

  const categories = [...new Set(transactions.filter((t) => !t.isSample).map((t) => t.category))];

  const periodOptions = [
    { value: "daily", label: t("transactions.filters.today") },
    { value: "weekly", label: t("transactions.filters.week") },
    { value: "monthly", label: t("transactions.filters.month") },
    { value: "annually", label: t("transactions.filters.year") },
    { value: "all", label: t("transactions.filters.all") },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={120} borderRadius={16} />
        </div>
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="space-y-3">
            <Skeleton width={140} height={20} />
            <Skeleton height={72} borderRadius={18} />
          </div>
        ))}
      </div>
    );
  }

  if (!currentUser && !isDemo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold">{t("transactions.accessRequired")}</h2>
          <p className="text-muted-foreground">{t("transactions.loginRequired")}</p>
        </div>
      </div>
    );
  }

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  return (
    <div className="page-shell -mt-6 pt-0">
      <div className="sticky top-0 z-20 rounded-2xl border border-border bg-card/90 backdrop-blur-md p-3 md:p-4 shadow-md">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              💳 {t("transactions.title")}
            </h1>
            <div className="text-primary text-sm italic">{quote}</div>
            <div className="text-sm text-muted-foreground">
              {filteredTransactions.length} {t("of")} {transactions.length}
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            disabled={isDemo && !canAddMoreTransactions}
            className="gap-2"
          >
            <FiPlus />
            {!isMobile && t("addTransaction")}
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder={t("searchTransactions")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="md:flex-1">
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto gap-2"
            >
              <FiFilter />
              {showFilters ? t("transactions.filters.hide") : t("transactions.filters.show")}
            </Button>
          </div>

          {isDemo && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary flex items-center gap-2">
              <Badge variant="secondary">{transactions.length}/{maxTransactions}</Badge>
              <span>{t("transactions.demoMode")}</span>
            </div>
          )}

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid gap-3 md:grid-cols-2"
              >
                <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="all">{t("transactions.filters.allTypes")}</option>
                  <option value="income">{t("income")}</option>
                  <option value="expense">{t("expense")}</option>
                </Select>
                <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="all">Categorie</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </Select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-4 pb-6 pt-3">
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map((group, groupIndex) => (
            <motion.div
              key={group.date.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {group.displayDate}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-2">
                {group.transactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card/80 p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full ${
                          transaction.type === "income"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {transaction.type === "income" ? "💰" : getCategoryEmoji(transaction.category)}
                      </div>
                      <div className="space-y-1">
                        <div className="text-base font-semibold leading-tight">{transaction.description}</div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{dayjs(getTransactionDate(transaction)).locale(i18n.language).format(i18n.language === "it" ? "DD MMM YYYY" : "MMM DD, YYYY")}</span>
                          <span>•</span>
                          <span>{getCategoryLabel(transaction.category)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-base font-bold ${
                          transaction.type === "income" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTransaction(transaction);
                          }}
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(transaction.id);
                          }}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl">
              💳
            </div>
            <h3 className="text-xl font-semibold text-foreground">{t("transactions.empty.title")}</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== "all" || selectedType !== "all"
                ? t("transactions.empty.tryFilters")
                : t("transactions.empty.addFirst")}
            </p>
            <Button
              className="mt-4 gap-2"
              onClick={() => setShowModal(true)}
              disabled={isDemo && !canAddMoreTransactions}
            >
              <FiPlus />
              {t("addTransaction")}
            </Button>
          </motion.div>
        )}
      </div>

      <TransactionModal
        show={showModal || !!editTransaction}
        onClose={() => {
          setShowModal(false);
          setEditTransaction(null);
        }}
        transaction={editTransaction}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-3 text-lg font-semibold">{t("confirmDelete")}</div>
            <div className="mb-4 space-y-1">
              <div className="font-bold text-foreground">
                {transactions.find((t) => t.id === deleteConfirm)?.description}
              </div>
              <div className="text-muted-foreground text-sm">
                {formatGroupDate(getTransactionDate(transactions.find((t) => t.id === deleteConfirm)))} •{" "}
                {getCategoryLabel(transactions.find((t) => t.id === deleteConfirm)?.category)}
              </div>
              <div
                className={`font-semibold ${
                  transactions.find((t) => t.id === deleteConfirm)?.type === "income"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {transactions.find((t) => t.id === deleteConfirm)?.type === "income" ? "+" : "-"}
                {formatCurrency(transactions.find((t) => t.id === deleteConfirm)?.amount)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                {t("cancel")}
              </Button>
              <Button variant="destructive" className="flex-1" onClick={confirmDelete}>
                {t("transactions.deleteConfirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
