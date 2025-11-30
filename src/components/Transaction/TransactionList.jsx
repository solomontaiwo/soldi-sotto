import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUnifiedTransactions } from "../../context/UnifiedTransactionProvider.jsx";
import { useAuth } from "../../context/AuthProvider.jsx";
import TransactionModal from "./TransactionModal.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useMediaQuery } from "react-responsive";
import formatCurrency from "../../utils/formatCurrency.jsx";
import { FiPlus, FiTrash2, FiFilter, FiSearch, FiEdit2 } from "react-icons/fi";
import { useCategories } from "../../utils/categories.jsx";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Badge } from "../ui/badge";
import { useDateRange } from "../../hooks/useDateRange.jsx";
import { useTransactionFilter } from "../../hooks/useTransactionFilter.jsx";

const TransactionList = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const {
    transactions, // This is the limited recent stream
    loading: transactionsLoading,
    deleteTransaction,
    isDemo,
    canAddMoreTransactions,
    maxTransactions,
    fetchAllTransactions, // New method to fetch more history
    getTotalTransactionCount, // New method to get total count
  } = useUnifiedTransactions();

  const { expenseCategories, incomeCategories } = useCategories();

  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Local state for loaded transactions (for scalability)
  const [allLoadedTransactions, setAllLoadedTransactions] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Logic to determine if more exist could be improved
  const [totalTransactionCount, setTotalTransactionCount] = useState(0); // For "X of Y" display

  // Using custom hooks
  const { period, setPeriod, startDate, endDate } = useDateRange("monthly");
  
  // Fetch total count on mount for authenticated users
  useEffect(() => {
    const fetchCount = async () => {
      if (currentUser && !isDemo) {
        const count = await getTotalTransactionCount();
        setTotalTransactionCount(count);
      } else if (isDemo) {
        setTotalTransactionCount(transactions.length); // For demo, initial transactions are the total
      }
    };
    fetchCount();
  }, [currentUser, isDemo, getTotalTransactionCount, transactions]);

  // Update loaded transactions when live transactions update (dashboard sync)
  useEffect(() => {
    if (transactions.length > 0) {
      setAllLoadedTransactions(prev => {
        // Merge fresh live transactions with existing loaded ones, avoiding duplicates
        const existingIds = new Set(prev.map(t => t.id));
        const newTransactions = transactions.filter(t => !existingIds.has(t.id));
        
        // Simpler: For now, just use 'transactions' as base. 
        // If user wants "history", we fetchAll and replace? 
        // Or better: Initialize 'allLoadedTransactions' with 'transactions' on mount.
        // If full history is loaded, don't override with recent 50.
        // If full history not loaded yet, just use recent.
        if (allLoadedTransactions.length === 0 || allLoadedTransactions.length <= transactions.length) {
            // If no full history loaded yet, or current full history is smaller than recent (unlikely),
            // initialize with recent.
            return transactions.sort((a, b) => b.date - a.date);
        }
        
        // Otherwise, if full history is loaded, just prepend new transactions
        return [...newTransactions, ...prev].sort((a, b) => b.date - a.date);
      });
    }
  }, [transactions]); // Depend on transactions (recent stream)

  // Load initial data or full history if needed
  // For scalable solution: Dashboard loads recent (50). 
  // List page *could* load more.
  // Let's implement a manual "Load Full History" for now to solve the "search/filter" issue 
  // or just rely on the 'recent' list for default view.
  
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    // As a quick scalability fix without deep pagination cursors everywhere, 
    // let's fetch ALL for the 'List' view if requested, or a larger chunk.
    // Since we refactored service to 'fetchAll', let's use that but warn it might be heavy.
    const fullHistory = await fetchAllTransactions();
    setAllLoadedTransactions(fullHistory);
    setTotalTransactionCount(fullHistory.length); // Update total count to actual fetched count
    setHasMore(false); // Assumes we fetched everything
    setIsLoadingMore(false);
  };

  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isDemo && allLoadedTransactions.length > 0 && totalTransactionCount > allLoadedTransactions.length) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    const currentRef = sentinelRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoadingMore, isDemo, allLoadedTransactions.length, totalTransactionCount, handleLoadMore]);

  const {
    filteredTransactions,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
  } = useTransactionFilter(allLoadedTransactions.length > 0 ? allLoadedTransactions : transactions, { startDate, endDate });

  const { t, i18n } = useTranslation();

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const loading = authLoading || (transactionsLoading && allLoadedTransactions.length === 0);

  const motivationalQuotes = useMemo(() => t("dashboard.motivationalQuotes", { returnObjects: true }), [t]);
  const [quote, setQuote] = useState("");
  useEffect(() => {
    if (motivationalQuotes && motivationalQuotes.length > 0) {
      setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }
  }, [motivationalQuotes]);

  const getDateLocale = (lang) => {
    return lang === "it" ? it : enUS;
  };

  const formatGroupDate = (date) => {
    const lang = i18n.language || "it";
    if (isToday(date)) return t("transactions.today");
    if (isYesterday(date)) return t("transactions.yesterday");
    
    const locale = getDateLocale(lang);
    const pattern = lang === "it" ? "dd MMMM yyyy" : "MMM dd, yyyy";
    return format(date, pattern, { locale });
  };

  const groupTransactionsByDate = (transactions) => {
    const groups = {};
    transactions.forEach((transaction) => {
      const date = transaction.date;
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

  const handleDeleteClick = useCallback(async (transactionId) => {
    setDeleteConfirm(transactionId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirm) {
      const success = await deleteTransaction(deleteConfirm);
      if (success) setDeleteConfirm(null);
      // Update local state manually to avoid refetch wait
      setAllLoadedTransactions(prev => prev.filter(t => t.id !== deleteConfirm));
    }
  }, [deleteConfirm, deleteTransaction]);

  const categories = [...new Set(allLoadedTransactions.length > 0 ? allLoadedTransactions.map(t => t.category) : transactions.map(t => t.category))];

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
              <Badge variant="secondary">{transactions.filter(t => !t.isSample).length}/{maxTransactions}</Badge>
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
                          <span>
                            {format(transaction.date, i18n.language === "it" ? "dd MMM yyyy" : "MMM dd, yyyy", { locale: getDateLocale(i18n.language) })}
                          </span>
                          <span>•</span>
                          <span>{getCategoryLabel(transaction.category)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-base font-bold ${
                          transaction.type === "income" ? "text-emerald-600"
                            : "text-rose-600"
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
        
        {/* Infinite Scroll Sentinel */}
        {hasMore && !isDemo && allLoadedTransactions.length > 0 && totalTransactionCount > allLoadedTransactions.length && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                {t("loading")}
              </div>
            )}
          </div>
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

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDelete")}</DialogTitle>
            <DialogDescription>
              {t("transactions.deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          
          {(() => {
             const transactionToDelete = allLoadedTransactions.find(t => t.id === deleteConfirm) || transactions.find((t) => t.id === deleteConfirm);
             if (!transactionToDelete) return null;
             return (
               <div className="py-4 space-y-1">
                  <div className="font-bold text-foreground">
                    {transactionToDelete.description}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {formatGroupDate(transactionToDelete.date)} •{" "}
                    {getCategoryLabel(transactionToDelete.category)}
                  </div>
                  <div
                    className={`font-semibold ${
                      transactionToDelete.type === "income"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {transactionToDelete.type === "income" ? "+" : "-"}
                    {formatCurrency(transactionToDelete.amount)}
                  </div>
               </div>
             );
          })()}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("transactions.deleteConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(TransactionList);