import { useState, useEffect, useCallback, useMemo } from "react";
import { useUnifiedTransactions } from "../Transaction/UnifiedTransactionProvider";
import { useAuth } from "../Auth/AuthProvider";
import { Button, Alert, Form, Badge } from "react-bootstrap";
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
import { it } from "date-fns/locale";
import { useMediaQuery } from "react-responsive";
import formatCurrency from "../../utils/formatCurrency";
import { 
  FiPlus, 
  FiTrash2, 
  FiFilter, 
  FiSearch,
  FiEdit2,
} from "react-icons/fi";
import { useCategories } from "../../utils/categories";
import { useTranslation } from 'react-i18next';

// TransactionList component: displays the list of transactions grouped by date
// Handles filtering, searching, and deletion of transactions
const TransactionList = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { 
    transactions, 
    loading: transactionsLoading,
    deleteTransaction,
    isDemo,
    canAddMoreTransactions,
    maxTransactions
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

  const { t } = useTranslation();

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const loading = authLoading || transactionsLoading;

  // Frasi motivazionali a rotazione
  const motivationalQuotes = useMemo(() => t('dashboard.motivationalQuotes', { returnObjects: true }), [t]);
  const [quote, setQuote] = useState("");
  useEffect(() => {
    if (motivationalQuotes && motivationalQuotes.length > 0) {
      setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }
  }, [motivationalQuotes]);

  // Utility functions for date formatting and category lookup
  const formatGroupDate = (date) => {
    if (isToday(date)) return t('transactions.today');
    if (isYesterday(date)) return t('transactions.yesterday');
    return format(date, "dd MMMM yyyy", { locale: it });
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
    
    transactions.forEach(transaction => {
      const date = getTransactionDate(transaction);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: date,
          displayDate: formatGroupDate(date),
          transactions: []
        };
      }
      
      groups[dateKey].transactions.push(transaction);
    });

    // Convert to array and sort by date (newest first)
    return Object.values(groups).sort((a, b) => b.date - a.date);
  };

  const getCategoryEmoji = (category) => {
    const allCategories = [...expenseCategories, ...incomeCategories];
    const categoryData = allCategories.find(c => c.value === category);
    return categoryData ? categoryData.label.split(" ")[0] : "💸";
  };

  const getCategoryLabel = (category) => {
    const allCategories = [...expenseCategories, ...incomeCategories];
    const categoryData = allCategories.find(c => c.value === category);
    return categoryData ? categoryData.label : category;
  };

  // Filter and search logic
  useEffect(() => {
    if (transactions.length > 0) {
      const today = new Date();
      let startDate, endDate;

      // Period filter
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

      let filtered = transactions.filter((transaction) => {
        const transactionDate = getTransactionDate(transaction);
        const inDateRange = transactionDate >= startDate && transactionDate <= endDate;
        
        // Search filter
        const matchesSearch = searchTerm === "" || 
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Category filter
        const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
        
        // Type filter
        const matchesType = selectedType === "all" || transaction.type === selectedType;
        
        return inDateRange && matchesSearch && matchesCategory && matchesType;
      });

      // Sort by date (newest first)
      filtered.sort((a, b) => getTransactionDate(b) - getTransactionDate(a));
      
      setFilteredTransactions(filtered);
    }
  }, [transactions, period, searchTerm, selectedCategory, selectedType]);

  // Handler for deleting a transaction (shows confirmation dialog)
  const handleDeleteClick = useCallback(async (transactionId) => {
    setDeleteConfirm(transactionId);
  }, []);

  // Handler for confirming deletion of a transaction
  const confirmDelete = useCallback(async () => {
    if (deleteConfirm) {
      const success = await deleteTransaction(deleteConfirm);
      if (success) {
        setDeleteConfirm(null);
      }
    }
  }, [deleteConfirm, deleteTransaction]);

  // Get unique categories from transactions
  const categories = [...new Set(transactions.map(t => t.category))];

  const periodOptions = [
    { value: "daily", label: t('transactions.filters.today') },
    { value: "weekly", label: t('transactions.filters.week') },
    { value: "monthly", label: t('transactions.filters.month') },
    { value: "annually", label: t('transactions.filters.year') },
    { value: "all", label: t('transactions.filters.all') }
  ];

  if (loading) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ background: 'var(--gradient-soft-blue)' }}
      >
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: 'var(--primary-500)' }} role="status">
            <span className="visually-hidden">{t('loading')}</span>
          </div>
          <h5 className="text-dark">{t('transactions.loadingTransactions')}</h5>
        </div>
      </div>
    );
  }

  if (!currentUser && !isDemo) {
    return (
      <div 
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: 'var(--gradient-soft-blue)' }}
      >
        <div className="text-center">
          <h2 className="display-6 text-dark mb-3">{t('transactions.accessRequired')}</h2>
          <p className="lead text-muted">{t('transactions.loginRequired')}</p>
        </div>
      </div>
    );
  }

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  return (
    <div 
      className="min-vh-100" 
      style={{ 
        background: 'transparent',
        overflowX: 'hidden', // Previene scroll orizzontale
        WebkitOverflowScrolling: 'touch' // Smooth scrolling iOS
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="position-sticky top-0"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 1px 20px rgba(0, 0, 0, 0.08)",
          zIndex: 1020,
          padding: isMobile ? "16px 0" : "16px 0"
        }}
      >
        <div className="container">
          {/* Title and Stats */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h1 className={`fw-bold text-dark mb-1 ${isMobile ? "h4" : "h2"}`}>
                💳 {t('transactions.title')}
              </h1>
              <div className="text-primary fw-medium mb-2" style={{ fontSize: isMobile ? '1rem' : '1.15rem', opacity: 0.85 }}>
                <span style={{ fontStyle: 'italic' }}>{quote}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Badge 
                  className="small"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px'
                  }}
                >
                  {filteredTransactions.length}
                </Badge>
                {filteredTransactions.length !== transactions.length && (
                  <span className="text-muted small">
                    {t('transactions.of')} {transactions.length}
                  </span>
                )}
              </div>
            </div>
            
            {/* Add Button */}
            <Button
              variant="primary"
              size={isMobile ? "sm" : "md"}
              onClick={() => setShowModal(true)}
              disabled={isDemo && !canAddMoreTransactions}
              className="d-flex align-items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                borderColor: 'var(--primary-500)',
                borderRadius: '1.5rem',
                padding: isMobile ? '8px 16px' : '12px 20px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <FiPlus size={isMobile ? 16 : 18} />
              {!isMobile && <span>{t('addTransaction')}</span>}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="position-relative mb-3">
            <FiSearch 
              className="position-absolute top-50 start-0 translate-middle-y text-muted ms-3" 
              size={18} 
            />
            <Form.Control
              type="text"
              className="ps-5 border-0"
              placeholder={t('searchTransactions')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                borderRadius: "1.5rem",
                padding: isMobile ? "12px 16px 12px 48px" : "14px 16px 14px 48px",
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            />
          </div>

          {/* Filters Row */}
          <div className={`d-flex gap-2 mb-2 ${isMobile ? 'flex-column' : 'flex-row'}`}>
            <Form.Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border-0"
              style={{ 
                borderRadius: "0.75rem",
                fontSize: isMobile ? "14px" : "16px",
                flex: isMobile ? "none" : "1",
                marginBottom: isMobile ? "8px" : "0",
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>

            <Button
              variant={showFilters ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="d-flex align-items-center gap-1 px-3"
              style={{ 
                borderRadius: "0.75rem",
                background: showFilters 
                  ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' 
                  : 'rgba(255, 255, 255, 0.75)',
                borderColor: showFilters ? 'var(--primary-500)' : 'rgba(255, 255, 255, 0.3)',
                color: showFilters ? 'white' : 'var(--text-secondary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                minWidth: isMobile ? "100%" : "auto"
              }}
            >
              <FiFilter size={16} />
              {!isMobile && t('transactions.filters.label')}
              {isMobile && (showFilters ? t('transactions.filters.hide') : t('transactions.filters.show'))}
            </Button>
          </div>

          {/* Demo Alert */}
          {isDemo && (
            <Alert variant="info" className="mb-0 border-0 small" style={{
              background: 'rgba(255, 255, 255, 0.6)',
              color: 'var(--text-secondary)',
              borderRadius: "1.5rem",
              padding: isMobile ? "8px 12px" : "12px 16px",
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}>
              <div className="d-flex align-items-center gap-2">
                <span>🎯</span>
                <span>
                  <strong>{t('transactions.demoMode')}</strong> - {transactions.length}/{maxTransactions} {t('transactions.transactions')}
                </span>
              </div>
            </Alert>
          )}

          {/* Extended Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className={`${isMobile ? 'd-flex flex-column gap-2' : 'row g-2'}`}>
                  <div className={isMobile ? 'w-100' : 'col-6'}>
                    <Form.Select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="border-0 small"
                      style={{ 
                        borderRadius: "0.75rem",
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <option value="all">{t('transactions.filters.allTypes')}</option>
                      <option value="income">{t('income')}</option>
                      <option value="expense">{t('expense')}</option>
                    </Form.Select>
                  </div>
                  <div className={isMobile ? 'w-100' : 'col-6'}>
                    <Form.Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border-0 small"
                      style={{ 
                        borderRadius: "0.75rem",
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <option value="all">Categorie</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Transaction Timeline */}
      <div 
        className="container"
        style={{ 
          paddingBottom: isMobile ? "100px" : "40px",
          paddingTop: "20px"
        }}
      >
        {groupedTransactions.length > 0 ? (
          <div className="mt-4">
            <AnimatePresence>
              {groupedTransactions.map((group, groupIndex) => (
                <motion.div
                  key={group.date.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                  className="mb-5"
                >
                  {/* Date Header */}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div 
                      className="flex-grow-1" 
                      style={{ 
                        height: "2px", 
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '1px'
                      }} 
                    />
                    <span 
                      className="fw-medium px-3 py-1 timeline-date-badge"
                      style={{
                        background: 'var(--timeline-date-bg, rgba(255,255,255,0.65))',
                        color: 'var(--timeline-date-color, var(--text-secondary))',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        border: '1px solid var(--timeline-date-border, rgba(0,0,0,0.08))',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      {group.displayDate}
                    </span>
                    <div 
                      className="flex-grow-1" 
                      style={{ 
                        height: "2px", 
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '1px'
                      }} 
                    />
                  </div>

                  {/* Transactions for this date */}
                  <div className="d-flex flex-column gap-3">
                    {group.transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="d-flex align-items-center justify-content-between p-3 mb-2 rounded-3 transaction-card"
                        style={{
                          background: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          minHeight: isMobile ? "70px" : "60px"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 1)";
                          e.currentTarget.style.transform = "translateX(4px)";
                          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                          e.currentTarget.style.transform = "translateX(0)";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        {/* Left: Icon and Info */}
                        <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ minWidth: 0 }}>
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: isMobile ? "44px" : "40px",
                              height: isMobile ? "44px" : "40px",
                              backgroundColor: transaction.type === "income" 
                                ? "rgba(34, 197, 94, 0.15)" 
                                : "rgba(239, 68, 68, 0.15)",
                              color: transaction.type === "income" ? "#22c55e" : "#ef4444",
                              fontSize: isMobile ? "18px" : "16px"
                            }}
                          >
                            {transaction.type === "income" ? "💰" : getCategoryEmoji(transaction.category)}
                          </div>
                          
                          <div className="flex-grow-1" style={{ minWidth: 0, overflow: "hidden" }}>
                            <div 
                              className="fw-semibold text-dark mb-1"
                              style={{
                                fontSize: isMobile ? "15px" : "14px",
                                lineHeight: "1.3",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {transaction.description}
                            </div>
                            
                            {isMobile ? (
                              // Mobile: Stack info vertically 
                              <div>
                                <div className="text-muted small mb-1" style={{ fontSize: "12px" }}>
                                  {getTransactionDate(transaction).toLocaleDateString("it-IT", {
                                    day: "2-digit",
                                    month: "short"
                                  })}
                                </div>
                                <div className="text-muted small" style={{ fontSize: "11px", opacity: 0.8 }}>
                                  {getCategoryLabel(transaction.category)}
                                </div>
                              </div>
                            ) : (
                              // Desktop: Single line
                              <div className="text-muted small d-flex align-items-center gap-2">
                                <span>{getTransactionDate(transaction).toLocaleDateString("it-IT")}</span>
                                <span>•</span>
                                <span>{getCategoryLabel(transaction.category)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Amount and Actions */}
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                          <div className="text-end">
                            <div
                              className="fw-bold"
                              style={{
                                fontSize: isMobile ? "16px" : "15px",
                                color: transaction.type === "income" ? "#22c55e" : "#ef4444",
                                lineHeight: "1.2"
                              }}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </div>
                            {isMobile && (
                              <div className="text-muted small" style={{ fontSize: "10px" }}>
                                {getTransactionDate(transaction).toLocaleDateString("it-IT", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="d-flex align-items-center gap-1">
                            <Button
                              variant="link"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTransaction(transaction);
                              }}
                              className="text-info p-1 d-flex align-items-center justify-content-center"
                              style={{
                                width: isMobile ? "32px" : "28px",
                                height: isMobile ? "32px" : "28px",
                                borderRadius: "8px",
                                backgroundColor: "rgba(13, 202, 240, 0.1)",
                                border: "1px solid rgba(13, 202, 240, 0.2)"
                              }}
                            >
                              <FiEdit2 size={isMobile ? 14 : 12} />
                            </Button>
                            
                            <Button
                              variant="link"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(transaction.id);
                              }}
                              className="text-danger p-1 d-flex align-items-center justify-content-center"
                              style={{
                                width: isMobile ? "32px" : "28px",
                                height: isMobile ? "32px" : "28px",
                                borderRadius: "8px",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)"
                              }}
                            >
                              <FiTrash2 size={isMobile ? 14 : 12} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-5"
            style={{ marginTop: '3rem' }}
          >
            <div 
              className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '120px',
                height: '120px',
                background: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <span style={{ fontSize: '3rem' }}>💳</span>
            </div>
            <h3 className="text-dark fw-bold mb-2">{t('transactions.empty.title')}</h3>
            <p className="text-muted mb-4">
              {searchTerm || selectedCategory !== "all" || selectedType !== "all" 
                ? t('transactions.empty.tryFilters')
                : t('transactions.empty.addFirst')
              }
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowModal(true)}
              disabled={isDemo && !canAddMoreTransactions}
              className="d-flex align-items-center gap-2 mx-auto"
              style={{
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                borderColor: 'var(--primary-500)',
                borderRadius: '1.5rem',
                padding: '12px 24px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FiPlus size={20} />
              Aggiungi Transazione
            </Button>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        show={showModal || !!editTransaction}
        onClose={() => {
          setShowModal(false);
          setEditTransaction(null);
        }}
        transaction={editTransaction}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.18)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.89) 100%)",
              borderRadius: "28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              padding: "32px 28px",
              minWidth: "320px",
              maxWidth: "95vw",
              border: "1px solid rgba(0,0,0,0.08)",
              textAlign: "center"
            }}
          >
            <div className="mb-3 fw-semibold" style={{ fontSize: "1.1rem" }}>
              {t('confirmDelete')}
            </div>
            <div className="mb-3">
              <div className="fw-bold text-dark mb-1">{transactions.find(t => t.id === deleteConfirm)?.description}</div>
              <div className="text-muted small mb-1">
                {formatGroupDate(getTransactionDate(transactions.find(t => t.id === deleteConfirm)))} • {getCategoryLabel(transactions.find(t => t.id === deleteConfirm)?.category)}
              </div>
              <div className="fw-bold" style={{ color: transactions.find(t => t.id === deleteConfirm)?.type === 'income' ? '#198754' : '#dc3545' }}>
                {transactions.find(t => t.id === deleteConfirm)?.type === 'income' ? '+' : '-'}{formatCurrency(transactions.find(t => t.id === deleteConfirm)?.amount)}
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setDeleteConfirm(null)}
                style={{ borderRadius: "16px", minWidth: "120px" }}
              >
                {t('cancel')}
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
                style={{ borderRadius: "16px", minWidth: "180px" }}
              >
                {t('transactions.deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
